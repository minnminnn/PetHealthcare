import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  clinicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { AppointmentStatus, Prisma, Role } from "@prisma/client";
import { requireClinicAccess } from "@/server/authz/clinic-access";
import {
  activeAppointmentStatuses,
  assertFutureBooking,
  assertTransition,
  bookingSchema,
  clinicDayRange,
  overlaps,
} from "@/server/domain/appointments";

export const appointmentsRouter = createTRPCRouter({
  /** List appointments for current user (owner view) */
  myAppointments: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(AppointmentStatus).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
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
    .input(
      z.object({
        clinicId: z.string(),
        day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .query(async ({ ctx, input }) => {
      await requireClinicAccess(ctx.db, ctx.session.user, input.clinicId);

      const dateRange = clinicDayRange(input.day);

      return ctx.db.appointment.findMany({
        where: {
          clinicId: input.clinicId,
          scheduledAt: dateRange,
        },
        include: {
          pet: true,
          owner: { select: { id: true, name: true, phone: true } },
          vet: { include: { user: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: "asc" },
      });
    }),

  /** Serializable transactions prevent two concurrent requests taking the same slot. */
  book: protectedProcedure
    .input(bookingSchema)
    .mutation(async ({ ctx, input }) => {
      assertFutureBooking(input.scheduledAt);
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await ctx.db.$transaction(
            async (tx) => {
              const pet = await tx.pet.findFirst({
                where: {
                  id: input.petId,
                  ownerId: ctx.session.user.id,
                  isActive: true,
                },
              });
              if (!pet)
                throw new TRPCError({
                  code: "NOT_FOUND",
                  message: "Pet not found",
                });
              const clinic = await tx.clinic.findFirst({
                where: {
                  id: input.clinicId,
                  isVerified: true,
                  admin: { isActive: true },
                },
              });
              if (!clinic)
                throw new TRPCError({
                  code: "NOT_FOUND",
                  message: "Clinic not found",
                });
              if (
                clinic.specializations.length &&
                !clinic.specializations.includes(pet.species)
              ) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message:
                    "Clinic does not support this species / Phòng khám không hỗ trợ loài này",
                });
              }
              if (input.vetId) {
                const vet = await tx.vet.findFirst({
                  where: {
                    id: input.vetId,
                    clinicId: input.clinicId,
                    isVerified: true,
                    user: { isActive: true },
                  },
                });
                if (!vet)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                      "Vet does not belong to this clinic / Bác sĩ không thuộc phòng khám",
                  });
                if (
                  vet.specializations.length &&
                  !vet.specializations.includes(pet.species)
                )
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                      "Vet does not support this species / Bác sĩ không hỗ trợ loài này",
                  });
              }
              const candidates = await tx.appointment.findMany({
                where: {
                  status: { in: activeAppointmentStatuses },
                  scheduledAt: {
                    lt: new Date(
                      input.scheduledAt.getTime() +
                        input.durationMinutes * 60_000,
                    ),
                  },
                  OR: [
                    { petId: input.petId },
                    ...(input.vetId ? [{ vetId: input.vetId }] : []),
                  ],
                },
                select: { scheduledAt: true, durationMinutes: true },
              });
              if (
                candidates.some((other) =>
                  overlaps(
                    input.scheduledAt,
                    input.durationMinutes,
                    other.scheduledAt,
                    other.durationMinutes,
                  ),
                )
              ) {
                throw new TRPCError({
                  code: "CONFLICT",
                  message:
                    "Pet or vet already has an appointment at this time / Thú cưng hoặc bác sĩ đã có lịch trùng giờ",
                });
              }
              return tx.appointment.create({
                data: {
                  ...input,
                  ownerId: ctx.session.user.id,
                  status: "PENDING",
                },
              });
            },
            { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
          );
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2034"
          ) {
            if (attempt < 2) continue;
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Schedule changed; please try again / Lịch vừa thay đổi, vui lòng thử lại",
            });
          }
          throw error;
        }
      }
      throw new TRPCError({ code: "CONFLICT" });
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
        select: { clinicId: true, status: true },
      });
      if (!appointment) throw new TRPCError({ code: "NOT_FOUND" });

      await requireClinicAccess(ctx.db, ctx.session.user, appointment.clinicId);
      assertTransition(appointment.status, input.status);
      const result = await ctx.db.appointment.updateMany({
        where: { id: input.appointmentId, status: appointment.status },
        data: { status: input.status },
      });
      if (!result.count)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Appointment changed; reload the page",
        });
      return { ok: true };
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
      assertTransition(appt.status, AppointmentStatus.CANCELLED);
      const result = await ctx.db.appointment.updateMany({
        where: { id: input.appointmentId, status: appt.status },
        data: { status: AppointmentStatus.CANCELLED },
      });
      if (!result.count) throw new TRPCError({ code: "CONFLICT" });
      return { ok: true };
    }),
});
