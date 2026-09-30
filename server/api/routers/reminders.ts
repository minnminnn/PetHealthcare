import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ReminderType } from "@prisma/client";

export const remindersRouter = createTRPCRouter({
  /** List reminders for all of a user's pets */
  list: protectedProcedure
    .input(z.object({ petId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.petId) {
        const pet = await ctx.db.pet.findFirst({
          where: {
            id: input.petId,
            ownerId: ctx.session.user.id,
            isActive: true,
          },
          select: { id: true },
        });
        if (!pet) throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.reminder.findMany({
        where: {
          ...(input.petId
            ? { petId: input.petId }
            : {
                pet: { ownerId: ctx.session.user.id },
              }),
          pet: { ownerId: ctx.session.user.id, isActive: true },
        },
        include: {
          pet: {
            select: { id: true, name: true, species: true, avatarUrl: true },
          },
        },
        orderBy: { dueAt: "asc" },
      });
    }),

  /** Create a reminder and schedule Inngest job */
  create: protectedProcedure
    .input(
      z.object({
        petId: z.string(),
        type: z.nativeEnum(ReminderType),
        title: z.string().min(1).max(200),
        dueAt: z.date(),
        repeatDays: z.number().int().min(1).max(3650).optional(),
        channel: z
          .array(z.enum(["IN_APP", "EMAIL"]))
          .min(1)
          .default(["IN_APP"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pet ownership
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet?.isActive || pet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (input.dueAt <= new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Choose a future reminder time / Chọn thời gian nhắc trong tương lai",
        });
      if (input.channel.includes("EMAIL") && !process.env.RESEND_API_KEY)
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Email is not configured; use in-app reminders / Chưa cấu hình email, hãy chọn thông báo trong ứng dụng",
        });
      // The scheduler polls persisted due reminders. Saving does not depend on an external event API.
      return ctx.db.reminder.create({ data: input });
    }),

  /** Toggle active state */
  toggle: protectedProcedure
    .input(z.object({ reminderId: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const reminder = await ctx.db.reminder.findFirst({
        where: {
          id: input.reminderId,
          isSent: false,
          pet: { ownerId: ctx.session.user.id, isActive: true },
        },
        select: { id: true, dueAt: true },
      });
      if (!reminder) throw new TRPCError({ code: "NOT_FOUND" });

      if (input.isActive && reminder.dueAt <= new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Create a new future reminder / Hãy tạo nhắc lịch mới trong tương lai",
        });

      return ctx.db.reminder.update({
        where: { id: input.reminderId },
        data: { isActive: input.isActive },
      });
    }),

  /** Delete a reminder */
  delete: protectedProcedure
    .input(z.object({ reminderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reminder = await ctx.db.reminder.findFirst({
        where: {
          id: input.reminderId,
          isSent: false,
          pet: { ownerId: ctx.session.user.id, isActive: true },
        },
        select: { id: true, dueAt: true },
      });
      if (!reminder) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.reminder.delete({ where: { id: input.reminderId } });
    }),
});
