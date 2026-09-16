import { AppointmentStatus } from "@prisma/client";

export const VACCINATION_DUE_SOON_DAYS = 30;

export type VaccinationStatus = "upToDate" | "dueSoon" | "overdue" | "unknown";
export type PrescriptionStatus =
  "active" | "completed" | "scheduled" | "unknown";

const startOfDay = (value: Date) => {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
};

export function getVaccinationStatus(
  nextDueAt: Date | string | null | undefined,
  now = new Date(),
  dueSoonDays = VACCINATION_DUE_SOON_DAYS,
): VaccinationStatus {
  if (!nextDueAt) return "unknown";

  const dueDate = startOfDay(new Date(nextDueAt));
  const today = startOfDay(now);
  if (Number.isNaN(dueDate.getTime())) return "unknown";
  if (dueDate < today) return "overdue";

  const threshold = new Date(today);
  threshold.setDate(threshold.getDate() + dueSoonDays);
  return dueDate <= threshold ? "dueSoon" : "upToDate";
}

export function getPrescriptionStatus(
  issuedAt: Date | string | null | undefined,
  validUntil: Date | string | null | undefined,
  now = new Date(),
): PrescriptionStatus {
  if (!issuedAt) return "unknown";

  const issued = new Date(issuedAt);
  const end = validUntil ? new Date(validUntil) : null;
  if (Number.isNaN(issued.getTime()) || (end && Number.isNaN(end.getTime()))) {
    return "unknown";
  }
  if (issued > now) return "scheduled";
  if (end && end < now) return "completed";
  return "active";
}

export function groupAppointment(
  status: AppointmentStatus,
  scheduledAt: Date | string,
  now = new Date(),
) {
  if (
    status === AppointmentStatus.CANCELLED ||
    status === AppointmentStatus.NO_SHOW
  ) {
    return "cancelled" as const;
  }
  return new Date(scheduledAt) >= now
    ? ("upcoming" as const)
    : ("past" as const);
}

export function getWeightChange(
  history: Array<{ weight: number; recordedAt: Date | string }>,
) {
  if (history.length < 2) return null;
  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const previous = sorted.at(-2)?.weight;
  const current = sorted.at(-1)?.weight;
  if (previous == null || current == null) return null;
  return Number((current - previous).toFixed(2));
}

export function formatPetAge(
  dateOfBirth: Date | string | null | undefined,
  locale: string,
) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return null;

  const now = new Date();
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    now.getMonth() -
    birthDate.getMonth();

  if (months < 12) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "month",
      unitDisplay: "long",
    }).format(Math.max(months, 0));
  }

  const years = Math.floor(months / 12);
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "year",
    unitDisplay: "long",
  }).format(years);
}

export function formatPassportDate(
  value: Date | string | null | undefined,
  locale: string,
) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatPassportDateTime(
  value: Date | string | null | undefined,
  locale: string,
) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
