import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.notification.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ),
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.notification.updateMany({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { isRead: true, readAt: new Date() },
      });
      if (!result.count) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),
});
