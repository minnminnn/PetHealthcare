import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  clinicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { AppointmentStatus, ConsultationType, Role } from "@prisma/client";
import { requireClinicAccess } from "@/server/authz/clinic-access";
import { requirePermission, requirePetAccess } from "@/server/authz/pet-access";

export const appointmentsRouter = createTRPCRouter({
  /** List appointments for current user (owner view) */
  myAppointments: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(AppointmentStatus).optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.db.appointment.findMany({
        where: {
          ownerId: ctx.session.user.id,
          ...(input.status && { status: input.status }),
        },
        include: {
          pet: {
            select: { id: true, name: true, species: true, avatarUrl: true },
          },
          clinic: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              logoUrl: true,
            },
          },
          vet: { include: { user: { select: { name: true, image: true } } } },
        },
        orderBy: { scheduledAt: "desc" },
        skip,
        take: input.limit,
      });
    }),

  /** Clinic daily queue */
  clinicQueue: clinicProcedure
    .input(z.object({ clinicId: z.string(), date: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      await requireClinicAccess(ctx.db, ctx.session.user, input.clinicId);

      const targetDate = input.date ?? new Date();
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      return ctx.db.appointment.findMany({
        where: {
          clinicId: input.clinicId,
          scheduledAt: { gte: dayStart, lte: dayEnd },
          status: { notIn: [AppointmentStatus.CANCELLED] },
        },
        include: {
          pet: true,
          owner: { select: { id: true, name: true, phone: true } },
          vet: { include: { user: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: "asc" },
      });
    }),

  /** Book an appointment */
  book: protectedProcedure
    .input(
      z.object({
        petId: z.string(),
        clinicId: z.string(),
        vetId: z.string().optional(),
        type: z
          .nativeEnum(ConsultationType)
          .default(ConsultationType.IN_PERSON),
        scheduledAt: z.date(),
        durationMinutes: z.number().default(30),
        chiefComplaint: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pet ownership
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet || pet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Verify clinic exists
      const clinic = await ctx.db.clinic.findUnique({
        where: { id: input.clinicId },
      });
      if (!clinic)
        throw new TRPCError({ code: "NOT_FOUND", message: "Clinic not found" });

      return ctx.db.appointment.create({
        data: {
          petId: input.petId,
          ownerId: ctx.session.user.id,
          clinicId: input.clinicId,
          vetId: input.vetId,
          type: input.type,
          scheduledAt: input.scheduledAt,
          durationMinutes: input.durationMinutes,
          chiefComplaint: input.chiefComplaint,
          status: AppointmentStatus.PENDING,
        },
      });
    }),

  /** Update appointment status — clinic or vet */
  updateStatus: clinicProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        status: z.nativeEnum(AppointmentStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.db.appointment.findUnique({
        where: { id: input.appointmentId },
        select: { petId: true },
      });
      if (!appointment) throw new TRPCError({ code: "NOT_FOUND" });

      const access = await requirePetAccess(
        ctx.db,
        ctx.session.user,
        appointment.petId,
      );
      requirePermission(access.permissions, "canWriteMedicalRecords");

      return ctx.db.appointment.update({
        where: { id: input.appointmentId },
        data: { status: input.status },
      });
    }),

  /** Cancel appointment — owner */
  cancel: protectedProcedure
    .input(z.object({ appointmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appt = await ctx.db.appointment.findUnique({
        where: { id: input.appointmentId },
      });
      if (!appt) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        appt.ownerId !== ctx.session.user.id &&
        ctx.session.user.role !== Role.SYSTEM_ADMIN
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.appointment.update({
        where: { id: input.appointmentId },
        data: { status: AppointmentStatus.CANCELLED },
      });
    }),
});
