"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  HeartPulse,
  MapPin,
  PawPrint,
  Pill,
  ShieldCheck,
  Siren,
  Stethoscope,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/navigation";

gsap.registerPlugin(useGSAP);

interface PetSummary {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  avatarUrl: string | null;
  weight: number | null;
  bloodType: string;
  nextVaccine: { name: string; dateLabel: string } | null;
}

interface AppointmentSummary {
  id: string;
  petName: string;
  clinicName: string;
  dateLabel: string;
}

interface ReminderSummary {
  id: string;
  title: string;
  petName: string;
  dateLabel: string;
}

interface OwnerDashboardExperienceProps {
  user: { name: string | null | undefined; image: string | null | undefined };
  pets: PetSummary[];
  appointments: AppointmentSummary[];
  reminders: ReminderSummary[];
  summary: {
    pets: number;
    appointments: number;
    reminders: number;
    vaccinesDue: number;
  };
  clinicRequestPending: boolean;
  dataError: boolean;
}

const actionItems = [
  { href: "/clinics", key: "clinics", icon: MapPin },
  { href: "/pharmacy", key: "pharmacy", icon: Pill },
  { href: "/tele-vet", key: "teleVet", icon: Stethoscope },
  { href: "/emergency", key: "emergency", icon: Siren },
] as const;

export function OwnerDashboardExperience({
  user,
  pets,
  appointments,
  reminders,
  summary,
  clinicRequestPending,
  dataError,
}: OwnerDashboardExperienceProps) {
  const t = useTranslations("ownerDashboard");
  const root = useRef<HTMLDivElement>(null);
  const nextAppointment = appointments[0];
  const firstName = user.name?.trim().split(/\s+/).at(-1) ?? t("fallbackName");

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(
            "[data-dashboard-heading]",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.65 },
          )
          .fromTo(
            "[data-dashboard-reveal]",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.07 },
            "-=0.35",
          );

        gsap.fromTo(
          "[data-care-progress]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power3.out", delay: 0.35 },
        );
      });

      return () => media.revert();
    },
    { scope: root },
  );

  const stats = [
    { label: t("stats.pets"), value: summary.pets },
    { label: t("stats.appointments"), value: summary.appointments },
    { label: t("stats.reminders"), value: summary.reminders },
    { label: t("stats.vaccines"), value: summary.vaccinesDue },
  ];

  return (
    <div
      ref={root}
      className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#efefeb] text-[#20211f] dark:bg-[#151614] dark:text-[#f1f1ed]"
    >
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <header
          data-dashboard-heading
          className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#d85f53] text-[#1a1b19]">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PawPrint className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <p className="text-sm font-semibold text-[#676964] dark:text-[#b7b8b2]">
                {t("accountLabel")}
              </p>
            </div>
            <h1 className="max-w-3xl text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.96] tracking-[-0.065em] text-[#20211f] dark:text-[#f1f1ed]">
              {t("greeting", { name: firstName })}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#676964] dark:text-[#b7b8b2] sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/clinics"
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#b9473e] px-5 text-sm font-semibold text-[#f7f7f2] transition hover:-translate-y-0.5 hover:bg-[#953831] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] focus-visible:ring-offset-2 dark:bg-[#ef7569] dark:text-[#1a1b19] dark:hover:bg-[#f18a80]"
            >
              {t("findClinic")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard/pets"
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-black/15 px-5 text-sm font-semibold text-[#30312e] transition hover:-translate-y-0.5 hover:border-[#b9473e] hover:text-[#953831] active:translate-y-px dark:border-white/15 dark:text-[#f1f1ed] dark:hover:border-[#ef7569] dark:hover:text-[#ef7569]"
            >
              {t("openPassport")}
            </Link>
          </div>
        </header>

        {clinicRequestPending && (
          <div
            data-dashboard-reveal
            className="mt-8 flex items-start gap-3 rounded-2xl border border-[#d85f53]/30 bg-[#ffe4df] p-4 text-[#632c29] dark:border-[#ef7569]/30 dark:bg-[#ef7569]/10 dark:text-[#f4aaa3]"
          >
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">
                {t("clinicPending.title")}
              </p>
              <p className="mt-1 text-sm leading-6 opacity-85">
                {t("clinicPending.body")}
              </p>
            </div>
          </div>
        )}

        {dataError && (
          <div
            data-dashboard-reveal
            className="mt-8 flex items-start gap-3 rounded-2xl border border-[#b9473e]/35 bg-[#fff4f1] p-4 text-[#772f2b] dark:bg-[#b9473e]/10 dark:text-[#f19a90]"
            role="alert"
          >
            <CircleAlert
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">{t("dataError.title")}</p>
              <p className="mt-1 text-sm leading-6 opacity-85">
                {t("dataError.body")}
              </p>
            </div>
          </div>
        )}

        <section
          data-dashboard-reveal
          className="mt-10 overflow-hidden rounded-2xl border border-black/10 bg-[#20211f] text-[#f1f1ed] dark:border-white/10 dark:bg-[#242523]"
          aria-labelledby="care-horizon-title"
        >
          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:p-9">
            <div className="flex flex-col justify-between">
              <div>
                <HeartPulse
                  className="h-6 w-6 text-[#ef7569]"
                  aria-hidden="true"
                />
                <h2
                  id="care-horizon-title"
                  className="mt-7 text-2xl font-semibold tracking-[-0.035em] text-[#f1f1ed] sm:text-3xl"
                >
                  {t("careHorizon.title")}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#b7b8b2] sm:text-base">
                  {t("careHorizon.body")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 sm:p-6">
              {nextAppointment ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#ef7569]">
                        {t("nextAppointment")}
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#f1f1ed]">
                        {nextAppointment.petName}
                      </p>
                    </div>
                    <CalendarDays
                      className="h-5 w-5 text-[#b7b8b2]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-7 h-px overflow-hidden bg-white/10">
                    <div
                      data-care-progress
                      className="h-full origin-left bg-[#ef7569]"
                    />
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[#92948d]">{t("date")}</p>
                      <p className="mt-1 text-sm font-medium text-[#f1f1ed]">
                        {nextAppointment.dateLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#92948d]">{t("clinic")}</p>
                      <p className="mt-1 text-sm font-medium text-[#f1f1ed]">
                        {nextAppointment.clinicName}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-44 flex-col justify-between">
                  <CalendarDays
                    className="h-5 w-5 text-[#ef7569]"
                    aria-hidden="true"
                  />
                  <div className="mt-8">
                    <p className="text-lg font-semibold text-[#f1f1ed]">
                      {t("noAppointment.title")}
                    </p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#b7b8b2]">
                      {t("noAppointment.body")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-5 sm:p-6 ${index % 2 === 0 ? "border-r border-white/10" : ""} ${index < 2 ? "border-b border-white/10 lg:border-b-0" : ""} ${index > 0 ? "lg:border-l lg:border-white/10" : ""} lg:border-r-0`}
              >
                <dd className="font-mono text-2xl font-medium tabular-nums text-[#f1f1ed]">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs leading-5 text-[#92948d]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <section
              data-dashboard-reveal
              className="rounded-2xl border border-black/10 bg-[#f8f8f5] p-5 dark:border-white/10 dark:bg-[#20211f] sm:p-7"
              aria-labelledby="pets-title"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2
                    id="pets-title"
                    className="text-xl font-semibold tracking-[-0.025em] text-[#20211f] dark:text-[#f1f1ed]"
                  >
                    {t("pets.title")}
                  </h2>
                  <p className="mt-1 text-sm text-[#74766f] dark:text-[#aeb0aa]">
                    {t("pets.body")}
                  </p>
                </div>
                {pets.length > 0 && (
                  <Link
                    href="/dashboard/pets"
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#953831] hover:text-[#632c29] dark:text-[#ef7569] dark:hover:text-[#f4aaa3]"
                  >
                    {t("viewAll")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>

              {pets.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {pets.map((pet, index) => (
                    <Link
                      key={pet.id}
                      href={`/dashboard/pets/${pet.id}`}
                      className={`group overflow-hidden rounded-2xl border border-black/10 bg-[#efefeb] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#d85f53]/55 dark:border-white/10 dark:bg-[#292a28] dark:hover:border-[#ef7569]/55 ${pets.length % 2 === 1 && index === 0 ? "md:col-span-2" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#deded8] text-[#4b4d48] dark:bg-[#393a37] dark:text-[#c6c7c0]">
                          {pet.avatarUrl ? (
                            <img
                              src={pet.avatarUrl}
                              alt={pet.name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <PawPrint className="h-6 w-6" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="truncate text-base font-semibold text-[#20211f] dark:text-[#f1f1ed]">
                              {pet.name}
                            </h3>
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-[#92948d] transition-transform group-hover:translate-x-0.5 group-hover:text-[#b9473e] dark:group-hover:text-[#ef7569]"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="mt-1 truncate text-sm text-[#676964] dark:text-[#b7b8b2]">
                            {pet.breed ||
                              t(`species.${pet.species.toLowerCase()}`)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#74766f] dark:text-[#aeb0aa]">
                            {pet.weight != null && (
                              <span>
                                {t("pets.weight", { weight: pet.weight })}
                              </span>
                            )}
                            {pet.bloodType !== "UNKNOWN" && (
                              <span>
                                {t("pets.bloodType", {
                                  bloodType: formatBloodType(pet.bloodType),
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {pet.nextVaccine && (
                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/10 pt-3 text-xs dark:border-white/10">
                          <span className="truncate text-[#676964] dark:text-[#b7b8b2]">
                            {pet.nextVaccine.name}
                          </span>
                          <span className="shrink-0 font-medium text-[#953831] dark:text-[#ef7569]">
                            {pet.nextVaccine.dateLabel}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-[#efefeb] px-6 text-center dark:border-white/15 dark:bg-[#292a28]">
                  <PawPrint
                    className="h-7 w-7 text-[#b9473e] dark:text-[#ef7569]"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-base font-semibold text-[#30312e] dark:text-[#f1f1ed]">
                    {t("pets.emptyTitle")}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#676964] dark:text-[#b7b8b2]">
                    {t("pets.emptyBody")}
                  </p>
                </div>
              )}
            </section>

            <section
              data-dashboard-reveal
              className="rounded-2xl border border-black/10 bg-[#f8f8f5] p-5 dark:border-white/10 dark:bg-[#20211f] sm:p-7"
              aria-labelledby="reminders-title"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2
                    id="reminders-title"
                    className="text-xl font-semibold tracking-[-0.025em] text-[#20211f] dark:text-[#f1f1ed]"
                  >
                    {t("reminders.title")}
                  </h2>
                  <p className="mt-1 text-sm text-[#74766f] dark:text-[#aeb0aa]">
                    {t("reminders.body")}
                  </p>
                </div>
                <Bell
                  className="h-5 w-5 text-[#b9473e] dark:text-[#ef7569]"
                  aria-hidden="true"
                />
              </div>

              {reminders.length > 0 ? (
                <div className="mt-5">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="grid gap-2 border-b border-black/10 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5 dark:border-white/10"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#30312e] dark:text-[#f1f1ed]">
                          {reminder.title}
                        </p>
                        <p className="mt-1 text-xs text-[#74766f] dark:text-[#aeb0aa]">
                          {reminder.petName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#676964] dark:text-[#b7b8b2]">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {reminder.dateLabel}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-xl bg-[#efefeb] px-4 py-5 text-sm leading-6 text-[#676964] dark:bg-[#292a28] dark:text-[#b7b8b2]">
                  {t("reminders.empty")}
                </p>
              )}
            </section>
          </div>

          <aside
            className="space-y-6 lg:col-span-4"
            aria-label={t("actions.title")}
          >
            <section
              data-dashboard-reveal
              className="rounded-2xl border border-black/10 bg-[#f8f8f5] p-5 dark:border-white/10 dark:bg-[#20211f] sm:p-7"
            >
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#20211f] dark:text-[#f1f1ed]">
                {t("actions.title")}
              </h2>
              <p className="mt-1 text-sm text-[#74766f] dark:text-[#aeb0aa]">
                {t("actions.body")}
              </p>

              <nav className="mt-5 space-y-2" aria-label={t("actions.title")}>
                {actionItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="group flex min-h-14 items-center gap-3 rounded-xl border border-transparent px-3 transition hover:border-black/10 hover:bg-[#efefeb] active:translate-y-px dark:hover:border-white/10 dark:hover:bg-[#292a28]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#ffe4df] text-[#953831] dark:bg-[#ef7569]/12 dark:text-[#ef7569]">
                      <item.icon
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#30312e] dark:text-[#f1f1ed]">
                        {t(`actions.${item.key}.title`)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#74766f] dark:text-[#aeb0aa]">
                        {t(`actions.${item.key}.body`)}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#92948d] transition-transform group-hover:translate-x-0.5 group-hover:text-[#b9473e] dark:group-hover:text-[#ef7569]"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            </section>

            <section
              data-dashboard-reveal
              className="rounded-2xl border border-[#d85f53]/25 bg-[#ffe4df] p-5 text-[#632c29] dark:border-[#ef7569]/25 dark:bg-[#ef7569]/10 dark:text-[#f4aaa3] sm:p-7"
              aria-labelledby="care-note-title"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <h2 id="care-note-title" className="mt-5 text-lg font-semibold">
                {t("careNote.title")}
              </h2>
              <p className="mt-2 text-sm leading-6 opacity-85">
                {t("careNote.body")}
              </p>
              <Link
                href="/dashboard/pets"
                className="mt-5 inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold underline decoration-current/35 underline-offset-4 hover:decoration-current"
              >
                {t("careNote.action")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatBloodType(value: string) {
  return value
    .replaceAll("_", " ")
    .replace("POSITIVE", "+")
    .replace("NEGATIVE", "-");
}
