import { z } from "zod";
import { createTRPCRouter, protectedProcedure, clinicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BloodType, Species, DonorStatus } from "@prisma/client";

export const bloodDonorRouter = createTRPCRouter({
  /** Register a pet as a blood donor */
  register: protectedProcedure
    .input(z.object({
      petId: z.string(),
      ownerConsent: z.literal(true),
      city: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      healthNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({
        where: { id: input.petId },
        select: { id: true, ownerId: true, bloodType: true, weight: true, species: true },
      });

      if (!pet || pet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Minimum weight check (4kg for cats, 25kg for dogs)
      const minWeight = pet.species === Species.CAT ? 3.5 : 22;
      if (pet.weight && pet.weight < minWeight) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Pet weight (${pet.weight}kg) below minimum required (${minWeight}kg) for blood donation`,
        });
      }

      return ctx.db.bloodDonorProfile.upsert({
        where: { petId: input.petId },
        update: { ownerConsent: true, status: DonorStatus.PENDING_REVIEW, ...input },
        create: {
          petId: input.petId,
          bloodType: pet.bloodType,
          weight: pet.weight ?? undefined,
          status: DonorStatus.PENDING_REVIEW,
          ...input,
        },
      });
    }),

  /** List eligible donors by blood type and species — for clinic use */
  findDonors: clinicProcedure
    .input(z.object({
      bloodType: z.nativeEnum(BloodType),
      species: z.nativeEnum(Species),
      city: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.bloodDonorProfile.findMany({
        where: {
          bloodType: input.bloodType,
          status: DonorStatus.ELIGIBLE,
          ownerConsent: true,
          ...(input.city && { city: { contains: input.city, mode: "insensitive" } }),
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
    .input(z.object({
      clinicId: z.string(),
      bloodType: z.nativeEnum(BloodType),
      species: z.nativeEnum(Species),
      urgency: z.enum(["urgent", "critical"]).default("urgent"),
      description: z.string().optional(),
      expiresAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.bloodRequest.create({ data: input });

      // Find eligible donors in same city and create alert records
      const clinic = await ctx.db.clinic.findUnique({ where: { id: input.clinicId } });
      if (clinic) {
        const donors = await ctx.db.bloodDonorProfile.findMany({
          where: {
            bloodType: input.bloodType,
            status: DonorStatus.ELIGIBLE,
            ownerConsent: true,
            city: { contains: clinic.city, mode: "insensitive" },
            pet: { species: input.species },
          },
          select: { id: true },
          take: 50,
        });

        if (donors.length > 0) {
          await ctx.db.donationAlert.createMany({
            data: donors.map((d) => ({ donorProfileId: d.id, requestId: request.id })),
          });
        }
      }

      return { request, alertsSent: true };
    }),
});
