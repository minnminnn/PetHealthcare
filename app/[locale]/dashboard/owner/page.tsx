import { AppointmentStatus } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";

import { OwnerDashboardExperience } from "@/components/dashboard/OwnerDashboardExperience";
import type { Locale } from "@/i18n";
import { redirect as i18nRedirect } from "@/lib/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

interface PageProps {
  params: { locale: string };
  searchParams?: { clinicRequest?: string };
}

const UPCOMING_APPOINTMENT_STATUSES = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];

export default async function OwnerDashboardPage({
  params: { locale: localeParam },
  searchParams,
}: PageProps) {
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user) {
    return i18nRedirect({ href: "/login", locale });
  }

  const now = new Date();
  const vaccineWindow = new Date(now);
  vaccineWindow.setDate(vaccineWindow.getDate() + 90);

  let dataError = false;
  let pets: Awaited<ReturnType<typeof getOwnerPets>> = [];
  let appointments: Awaited<ReturnType<typeof getUpcomingAppointments>> = [];
  let reminders: Awaited<ReturnType<typeof getUpcomingReminders>> = [];
  let vaccinesDue = 0;
  let petCount = 0;
  let appointmentCount = 0;
  let reminderCount = 0;

  try {
    [
      pets,
      appointments,
      reminders,
      vaccinesDue,
      petCount,
      appointmentCount,
      reminderCount,
    ] = await Promise.all([
      getOwnerPets(session.user.id),
      getUpcomingAppointments(session.user.id, now),
      getUpcomingReminders(session.user.id, now),
      db.vaccination.count({
        where: {
          pet: { ownerId: session.user.id, isActive: true },
          nextDueAt: { gte: now, lte: vaccineWindow },
        },
      }),
      db.pet.count({ where: { ownerId: session.user.id, isActive: true } }),
      db.appointment.count({
        where: {
          ownerId: session.user.id,
          scheduledAt: { gte: now },
          status: { in: UPCOMING_APPOINTMENT_STATUSES },
        },
      }),
      db.reminder.count({
        where: {
          pet: { ownerId: session.user.id, isActive: true },
          isActive: true,
          dueAt: { gte: now },
        },
      }),
    ]);
  } catch (error) {
    dataError = true;
    console.error("Unable to load owner dashboard", error);
  }

  const dateTimeFormatter = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-AU",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Ho_Chi_Minh",
    },
  );
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-AU",
    { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" },
  );

  return (
    <OwnerDashboardExperience
      user={{
        name: session.user.name,
        image: session.user.image,
      }}
      pets={pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        avatarUrl: pet.avatarUrl,
        weight: pet.weight,
        bloodType: pet.bloodType,
        nextVaccine: pet.vaccinations[0]
          ? {
              name: pet.vaccinations[0].vaccineName,
              dateLabel: dateFormatter.format(pet.vaccinations[0].nextDueAt!),
            }
          : null,
      }))}
      appointments={appointments.map((appointment) => ({
        id: appointment.id,
        petName: appointment.pet.name,
        clinicName: appointment.clinic.name,
        dateLabel: dateTimeFormatter.format(appointment.scheduledAt),
      }))}
      reminders={reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        petName: reminder.pet.name,
        dateLabel: dateFormatter.format(reminder.dueAt),
      }))}
      summary={{
        pets: petCount,
        appointments: appointmentCount,
        reminders: reminderCount,
        vaccinesDue,
      }}
      clinicRequestPending={searchParams?.clinicRequest === "pending"}
      dataError={dataError}
    />
  );
}

function getOwnerPets(ownerId: string) {
  return db.pet.findMany({
    where: { ownerId, isActive: true },
    orderBy: { updatedAt: "desc" },
    take: 3,
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      avatarUrl: true,
      weight: true,
      bloodType: true,
      vaccinations: {
        where: { nextDueAt: { not: null } },
        orderBy: { nextDueAt: "asc" },
        take: 1,
        select: { vaccineName: true, nextDueAt: true },
      },
    },
  });
}

function getUpcomingAppointments(ownerId: string, now: Date) {
  return db.appointment.findMany({
    where: {
      ownerId,
      scheduledAt: { gte: now },
      status: { in: UPCOMING_APPOINTMENT_STATUSES },
    },
    orderBy: { scheduledAt: "asc" },
    take: 3,
    select: {
      id: true,
      scheduledAt: true,
      pet: { select: { name: true } },
      clinic: { select: { name: true } },
    },
  });
}

function getUpcomingReminders(ownerId: string, now: Date) {
  return db.reminder.findMany({
    where: {
      pet: { ownerId, isActive: true },
      isActive: true,
      dueAt: { gte: now },
    },
    orderBy: { dueAt: "asc" },
    take: 4,
    select: {
      id: true,
      title: true,
      dueAt: true,
      pet: { select: { name: true } },
    },
  });
}
