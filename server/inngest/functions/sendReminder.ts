import { inngest } from "@/server/inngest/client";
import { db } from "@/server/db";

export const dispatchDueReminders = inngest.createFunction(
  { id: "dispatch-due-reminders" },
  { cron: "* * * * *" },
  async ({ step }) => {
    const due = await step.run("find-due", () =>
      db.reminder.findMany({
        where: {
          isActive: true,
          isSent: false,
          dueAt: { lte: new Date() },
          channel: { hasSome: ["IN_APP", "EMAIL"] },
          pet: { isActive: true, owner: { isActive: true } },
        },
        select: { id: true },
        orderBy: { dueAt: "asc" },
        take: 100,
      }),
    );
    if (due.length)
      await step.sendEvent(
        "dispatch",
        due.map(({ id }) => ({
          name: "reminder/schedule",
          data: { reminderId: id },
        })),
      );
    return { dispatched: due.length };
  },
);

export const sendReminder = inngest.createFunction(
  {
    id: "send-pet-reminder",
    retries: 5,
    concurrency: { limit: 1, key: "event.data.reminderId" },
  },
  { event: "reminder/schedule" },
  async ({ event, step }) => {
    const reminderId = String(event.data.reminderId);
    const initial = await step.run("due-date", () =>
      db.reminder.findUnique({
        where: { id: reminderId },
        select: { dueAt: true },
      }),
    );
    if (!initial) return { skipped: true };
    await step.sleepUntil("wait-until-due", initial.dueAt);
    return step.run("deliver", async () => {
      // Re-read after sleeping, so disabling/deleting a scheduled reminder takes effect.
      const reminder = await db.reminder.findUnique({
        where: { id: reminderId },
        include: { pet: { include: { owner: true } } },
      });
      if (
        !reminder?.isActive ||
        reminder.isSent ||
        !reminder.pet.isActive ||
        !reminder.pet.owner.isActive
      )
        return { skipped: true };
      const { pet } = reminder;
      const locale = pet.owner.locale === "en" ? "en" : "vi";
      const url = `/${locale}/dashboard/pets/${pet.id}`;
      if (reminder.channel.includes("IN_APP")) {
        await db.notification.upsert({
          where: { id: `reminder-${reminder.id}` },
          update: {},
          create: {
            id: `reminder-${reminder.id}`,
            userId: pet.ownerId,
            title: reminder.title,
            body: `${pet.name}: ${reminder.title}`,
            url,
            channel: "IN_APP",
            data: { reminderId },
          },
        });
      }
      if (reminder.channel.includes("EMAIL")) {
        if (!process.env.RESEND_API_KEY || !pet.owner.email)
          throw new Error("Reminder email is not configured");
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `reminder-${reminder.id}`,
          },
          body: JSON.stringify({
            from:
              process.env.RESEND_FROM_EMAIL ?? "PetCare <nhacnho@petcare.vn>",
            to: [pet.owner.email],
            subject: `PetCare: ${reminder.title}`,
            text: `${pet.name}: ${reminder.title}\n${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${url}`,
          }),
        });
        if (!response.ok)
          throw new Error(
            `Reminder email delivery failed (${response.status})`,
          );
      }
      if (
        !reminder.channel.some(
          (channel) => channel === "IN_APP" || channel === "EMAIL",
        )
      )
        throw new Error("No supported notification channel");
      // Mark delivery and create the next occurrence atomically. Stable IDs make retries safe.
      await db.$transaction(async (tx) => {
        const changed = await tx.reminder.updateMany({
          where: { id: reminder.id, isSent: false },
          data: { isSent: true, sentAt: new Date() },
        });
        if (!changed.count || !reminder.repeatDays || reminder.repeatDays < 1)
          return;
        const interval = reminder.repeatDays * 86400_000;
        const nextDue = new Date(
          reminder.dueAt.getTime() +
            Math.max(
              1,
              Math.floor((Date.now() - reminder.dueAt.getTime()) / interval) +
                1,
            ) *
              interval,
        );
        await tx.reminder.upsert({
          where: { id: `next-${reminder.id}` },
          update: {},
          create: {
            id: `next-${reminder.id}`,
            petId: pet.id,
            title: reminder.title,
            type: reminder.type,
            dueAt: nextDue,
            repeatDays: reminder.repeatDays,
            channel: reminder.channel.filter(
              (channel) => channel === "IN_APP" || channel === "EMAIL",
            ),
          },
        });
      });
      return { success: true };
    });
  },
);
