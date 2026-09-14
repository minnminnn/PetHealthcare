import { z } from "zod";
import { createTRPCRouter, protectedProcedure, clinicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Species, BloodType, Role } from "@prisma/client";

const createPetSchema = z.object({
  name: z.string().min(1).max(50),
  species: z.nativeEnum(Species),
  breed: z.string().optional(),
  color: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  isNeutered: z.boolean().default(false),
  microchipId: z.string().optional(),
  bloodType: z.nativeEnum(BloodType).default(BloodType.UNKNOWN),
  weight: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
});

export const petsRouter = createTRPCRouter({
  /** List all pets owned by the current user */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.pet.findMany({
      where: { ownerId: ctx.session.user.id, isActive: true },
      include: {
        vaccinations: { orderBy: { administeredAt: "desc" }, take: 1 },
        reminders: { where: { isActive: true, isSent: false }, orderBy: { dueAt: "asc" }, take: 3 },
        bloodDonor: true,
        _count: { select: { medicalRecords: true, appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Get a single pet by ID — enforces ownership or clinic/vet access */
  byId: protectedProcedure
    .input(z.object({ petId: z.string() }))
    .query(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({
        where: { id: input.petId, isActive: true },
        include: {
          owner: { select: { id: true, name: true, email: true, phone: true } },
          weightHistory: { orderBy: { recordedAt: "asc" } },
          vaccinations: { orderBy: { administeredAt: "desc" } },
          medicalRecords: {
            orderBy: { visitDate: "desc" },
            include: {
              clinic: { select: { id: true, name: true, logoUrl: true } },
              vet: { select: { id: true, user: { select: { name: true } } } },
            },
          },
          prescriptions: { orderBy: { issuedAt: "desc" } },
          reminders: { where: { isActive: true }, orderBy: { dueAt: "asc" } },
          bloodDonor: true,
          appointments: {
            orderBy: { scheduledAt: "desc" },
            take: 5,
            include: { clinic: { select: { name: true, phone: true } } },
          },
        },
      });

      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });

      const role = ctx.session.user.role as Role;
      const isOwner = pet.ownerId === ctx.session.user.id;
      const isPrivileged = role === Role.VET || role === Role.CLINIC_ADMIN || role === Role.SYSTEM_ADMIN;

      if (!isOwner && !isPrivileged) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return pet;
    }),

  /** Get passport data for QR code public view (by passportNumber) */
  byPassportNumber: protectedProcedure
    .input(z.object({ passportNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({
        where: { passportNumber: input.passportNumber, isActive: true },
        include: {
          owner: { select: { name: true } },
          vaccinations: { orderBy: { administeredAt: "desc" } },
          medicalRecords: {
            where: { isPrivate: false },
            orderBy: { visitDate: "desc" },
            take: 10,
          },
        },
      });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });
      return pet;
    }),

  /** Create a new pet */
  create: protectedProcedure
    .input(createPetSchema)
    .mutation(async ({ ctx, input }) => {
      const { weight, ...rest } = input;

      const pet = await ctx.db.pet.create({
        data: {
          ...rest,
          ownerId: ctx.session.user.id,
          weight: weight ?? null,
        },
      });

      // Record initial weight if provided
      if (weight) {
        await ctx.db.weightRecord.create({
          data: { petId: pet.id, weight, recordedBy: ctx.session.user.name ?? "Owner" },
        });
      }

      return pet;
    }),

  /** Update pet metadata — owners can update basic info */
  update: protectedProcedure
    .input(z.object({ petId: z.string(), data: createPetSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });
      if (pet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { weight, ...rest } = input.data;

      const updated = await ctx.db.pet.update({
        where: { id: input.petId },
        data: { ...rest, weight: weight ?? undefined },
      });

      // Log new weight if updated
      if (weight && weight !== pet.weight) {
        await ctx.db.weightRecord.create({
          data: { petId: pet.id, weight, recordedBy: ctx.session.user.name ?? "Owner" },
        });
      }

      return updated;
    }),

  /** Soft-delete a pet */
  delete: protectedProcedure
    .input(z.object({ petId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });
      if (pet.ownerId !== ctx.session.user.id && ctx.session.user.role !== Role.SYSTEM_ADMIN) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.pet.update({ where: { id: input.petId }, data: { isActive: false } });
    }),

  /** Add weight record — vet or owner */
  addWeight: protectedProcedure
    .input(z.object({ petId: z.string(), weight: z.number().positive(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });

      const role = ctx.session.user.role as Role;
      const isOwner = pet.ownerId === ctx.session.user.id;
      const isPrivileged = role === Role.VET || role === Role.CLINIC_ADMIN || role === Role.SYSTEM_ADMIN;
      if (!isOwner && !isPrivileged) throw new TRPCError({ code: "FORBIDDEN" });

      const [record] = await ctx.db.$transaction([
        ctx.db.weightRecord.create({
          data: {
            petId: input.petId,
            weight: input.weight,
            notes: input.notes,
            recordedBy: ctx.session.user.name ?? undefined,
          },
        }),
        ctx.db.pet.update({
          where: { id: input.petId },
          data: { weight: input.weight },
        }),
      ]);
      return record;
    }),
});
