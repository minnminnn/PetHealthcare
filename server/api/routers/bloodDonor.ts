import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  clinicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BloodType, Species, DonorStatus } from "@prisma/client";
import { requirePetAccess, requirePermission } from "@/server/authz/pet-access";
import { requireClinicAccess } from "@/server/authz/clinic-access";

export const bloodDonorRouter = createTRPCRouter({
  /** Register a pet as a blood donor */
  register: protectedProcedure
    .input(
      z.object({
        petId: z.string(),
        ownerConsent: z.literal(true),
        city: z.string().trim().min(2).max(100).optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        healthNotes: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { petId, ownerConsent, ...profileInput } = input;
      const pet = await ctx.db.pet.findUnique({
        where: { id: petId },
        select: {
          id: true,
          ownerId: true,
          bloodType: true,
          weight: true,
          species: true,
          isActive: true,
        },
      });

      if (!pet?.isActive || pet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (pet.species !== Species.DOG && pet.species !== Species.CAT)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Donor registration supports cats and dogs only / Chỉ hỗ trợ đăng ký cho chó và mèo",
        });
      // A registration is only an application; a clinician must review eligibility.
      const minWeight = pet.species === Species.CAT ? 3.5 : 22;
      if (pet.weight && pet.weight < minWeight) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Pet weight (${pet.weight}kg) below minimum required (${minWeight}kg) for blood donation`,
        });
      }

      return ctx.db.bloodDonorProfile.upsert({
        where: { petId },
        update: {
          ...profileInput,
          ownerConsent,
          status: DonorStatus.PENDING_REVIEW,
        },
        create: {
          petId,
          bloodType: pet.bloodType,
          weight: pet.weight ?? undefined,
          status: DonorStatus.PENDING_REVIEW,
          ownerConsent,
          ...profileInput,
        },
      });
    }),

  /** List eligible donors by blood type and species — for clinic use */
  findDonors: clinicProcedure
    .input(
      z.object({
        bloodType: z.nativeEnum(BloodType),
        species: z.nativeEnum(Species),
        city: z.string().trim().min(2).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.bloodDonorProfile.findMany({
        where: {
          bloodType: input.bloodType,
          OR: [
            { canDonateAfter: null },
            { canDonateAfter: { lte: new Date() } },
          ],
          status: DonorStatus.ELIGIBLE,
          ownerConsent: true,
          ...(input.city && {
            city: { contains: input.city, mode: "insensitive" },
          }),
          pet: { species: input.species, isActive: true },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              weight: true,
              avatarUrl: true,
              owner: { select: { name: true, phone: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });
    }),

  /** Clinic sends blood request and broadcasts to nearby donors */
  createRequest: clinicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        bloodType: z.nativeEnum(BloodType),
        species: z.nativeEnum(Species),
        urgency: z.enum(["urgent", "critical"]).default("urgent"),
        description: z.string().max(2000).optional(),
        expiresAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireClinicAccess(ctx.db, ctx.session.user, input.clinicId);
      if (
        input.expiresAt <= new Date() ||
        input.bloodType === BloodType.UNKNOWN
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A confirmed blood type and future expiry are required",
        });

      const typeMatches =
        input.species === Species.CAT
          ? input.bloodType.startsWith("FELINE_")
          : input.species === Species.DOG && input.bloodType.startsWith("DEA");
      if (!typeMatches)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Blood type must match the species / Nhóm máu phải đúng loài",
        });
      return ctx.db.$transaction(async (tx) => {
        const clinic = await tx.clinic.findUnique({
          where: { id: input.clinicId },
        });
        if (!clinic) throw new TRPCError({ code: "NOT_FOUND" });
        const request = await tx.bloodRequest.create({ data: input });
        const donors = await tx.bloodDonorProfile.findMany({
          where: {
            bloodType: input.bloodType,
            status: DonorStatus.ELIGIBLE,
            ownerConsent: true,
            OR: [
              { canDonateAfter: null },
              { canDonateAfter: { lte: new Date() } },
            ],
            city: { equals: clinic.city, mode: "insensitive" },
            pet: {
              species: input.species,
              isActive: true,
              owner: { isActive: true },
            },
          },
          select: { id: true },
          take: 50,
        });
        if (donors.length)
          await tx.donationAlert.createMany({
            data: donors.map((d) => ({
              donorProfileId: d.id,
              requestId: request.id,
            })),
          });
        return { request, alertsCreated: donors.length };
      });
    }),

  withdraw: protectedProcedure
    .input(z.object({ petId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const changed = await ctx.db.bloodDonorProfile.updateMany({
        where: { petId: input.petId, pet: { ownerId: ctx.session.user.id } },
        data: { ownerConsent: false, status: DonorStatus.ON_HOLD },
      });
      if (!changed.count) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),
  myAlerts: protectedProcedure.query(({ ctx }) =>
    ctx.db.donationAlert.findMany({
      where: {
        donorProfile: {
          ownerConsent: true,
          pet: { ownerId: ctx.session.user.id, isActive: true },
        },
        request: { isActive: true, expiresAt: { gt: new Date() } },
      },
      include: {
        donorProfile: { select: { pet: { select: { name: true } } } },
        request: {
          include: {
            clinic: { select: { name: true, phone: true, address: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ),
  respond: protectedProcedure
    .input(z.object({ alertId: z.string(), accept: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const changed = await ctx.db.donationAlert.updateMany({
        where: {
          id: input.alertId,
          donorProfile: {
            ownerConsent: true,
            pet: { ownerId: ctx.session.user.id, isActive: true },
          },
          request: { isActive: true, expiresAt: { gt: new Date() } },
        },
        data: { isAccepted: input.accept },
      });
      if (!changed.count) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),
  clinicDonors: clinicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireClinicAccess(ctx.db, ctx.session.user, input.clinicId);
      return ctx.db.bloodDonorProfile.findMany({
        where: {
          ownerConsent: true,
          pet: {
            isActive: true,
            OR: [
              { appointments: { some: { clinicId: input.clinicId } } },
              { medicalRecords: { some: { clinicId: input.clinicId } } },
            ],
          },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              owner: { select: { name: true } },
            },
          },
        },
        take: 100,
      });
    }),
  review: clinicProcedure
    .input(
      z.object({
        petId: z.string(),
        status: z.enum(["ELIGIBLE", "INELIGIBLE", "ON_HOLD"]),
        bloodType: z.nativeEnum(BloodType),
        isVaccinated: z.boolean(),
        reviewed: z.literal(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await requirePetAccess(
        ctx.db,
        ctx.session.user,
        input.petId,
      );
      requirePermission(access.permissions, "canWriteMedicalRecords");
      const pet = await ctx.db.pet.findUnique({
        where: { id: input.petId },
        select: { species: true },
      });
      const validType =
        pet?.species === Species.CAT
          ? input.bloodType.startsWith("FELINE_")
          : pet?.species === Species.DOG && input.bloodType.startsWith("DEA");
      if (!validType)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Blood type must match the species / Nhóm máu phải đúng loài",
        });
      return ctx.db.$transaction(async (tx) => {
        const changed = await tx.bloodDonorProfile.updateMany({
          where: { petId: input.petId, ownerConsent: true },
          data: {
            status: input.status,
            bloodType: input.bloodType,
            isVaccinated: input.isVaccinated,
          },
        });
        if (!changed.count) throw new TRPCError({ code: "NOT_FOUND" });
        await tx.pet.update({
          where: { id: input.petId },
          data: { bloodType: input.bloodType },
        });
        return { ok: true };
      });
    }),
  clinicRequests: clinicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireClinicAccess(ctx.db, ctx.session.user, input.clinicId);
      return ctx.db.bloodRequest.findMany({
        where: { clinicId: input.clinicId },
        include: {
          donationAlerts: {
            where: { isAccepted: true, donorProfile: { ownerConsent: true } },
            include: {
              donorProfile: {
                select: {
                  pet: {
                    select: {
                      name: true,
                      owner: { select: { name: true, phone: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),
});
