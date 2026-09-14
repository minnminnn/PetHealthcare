import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ReminderType, NotificationChannel } from "@prisma/client";
import { inngest } from "@/server/inngest/client";

export const remindersRouter = createTRPCRouter({
  /** List reminders for all of a user's pets */
  list: protectedProcedure
    .input(z.object({ petId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.reminder.findMany({
        where: {
          ...(input.petId
            ? { petId: input.petId }
            : {
                pet: { ownerId: ctx.session.user.id },
              }),
          isActive: true,
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
        repeatDays: z.number().optional(),
        channel: z
          .array(z.nativeEnum(NotificationChannel))
          .default(["PUSH", "EMAIL"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify pet ownership
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet || pet.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const reminder = await ctx.db.reminder.create({ data: input });

      // Schedule Inngest background job
      await inngest.send({
        name: "reminder/schedule",
        data: {
          reminderId: reminder.id,
          petId: pet.id,
          petName: pet.name,
          ownerId: ctx.session.user.id,
          dueAt: input.dueAt.toISOString(),
          type: input.type,
          title: input.title,
          channel: input.channel,
          repeatDays: input.repeatDays,
        },
        ts: input.dueAt.getTime(),
      });

      return reminder;
    }),

  /** Toggle active state */
  toggle: protectedProcedure
    .input(z.object({ reminderId: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.reminder.update({
        where: { id: input.reminderId },
        data: { isActive: input.isActive },
      });
    }),

  /** Delete a reminder */
  delete: protectedProcedure
    .input(z.object({ reminderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.reminder.delete({ where: { id: input.reminderId } });
    }),
});
