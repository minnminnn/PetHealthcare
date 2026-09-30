import { AppointmentStatus, ConsultationType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const bookingSchema = z.object({
  petId: z.string().min(1),
  clinicId: z.string().min(1),
  vetId: z.string().min(1).optional(),
  type: z
    .enum([ConsultationType.IN_PERSON, ConsultationType.FOLLOW_UP])
    .default("IN_PERSON"),
  scheduledAt: z.date(),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  chiefComplaint: z.string().trim().max(500).optional(),
});

export const activeAppointmentStatuses = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

export function assertFutureBooking(date: Date, now = new Date()) {
  if (date <= now)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Choose a future appointment time / Vui lòng chọn lịch trong tương lai",
    });
}

export function overlaps(
  start: Date,
  duration: number,
  otherStart: Date,
  otherDuration: number,
) {
  return (
    start.getTime() < otherStart.getTime() + otherDuration * 60_000 &&
    otherStart.getTime() < start.getTime() + duration * 60_000
  );
}

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
export function assertTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
) {
  if (!transitions[from].includes(to))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Invalid appointment status transition / Không thể chuyển trạng thái lịch khám",
    });
}

export function clinicDayRange(day: string) {
  const start = new Date(`${day}T00:00:00+07:00`);
  if (
    !Number.isFinite(start.getTime()) ||
    new Date(start.getTime() + 7 * 3600_000).toISOString().slice(0, 10) !== day
  ) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid date" });
  }
  return { gte: start, lt: new Date(start.getTime() + 86400_000) };
}
