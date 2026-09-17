"use client";

import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Droplets,
  FileHeart,
  MapPin,
  PawPrint,
  Pill,
  Printer,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UserRound,
  Weight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useRouter } from "@/lib/navigation";
import {
  formatPassportDate,
  formatPassportDateTime,
  formatPetAge,
  getPrescriptionStatus,
  getVaccinationStatus,
  getWeightChange,
  groupAppointment,
  type VaccinationStatus,
} from "@/lib/pets/passport-status";
import {
  buildPassportTimeline,
  filterPassportTimeline,
  type PassportTimelineType,
} from "@/lib/pets/passport-timeline";
import { api } from "@/trpc/react";
import { PassportActions } from "@/components/pets/passport/PassportActions";

const tabValues = [
  "overview",
  "timeline",
  "vaccinations",
  "records",
  "prescriptions",
  "appointments",
  "tracking",
  "documents",
] as const;

const statusTone: Record<string, string> = {
  upToDate: "bg-emerald-100 text-emerald-800",
  active: "bg-emerald-100 text-emerald-800",
  completed: "bg-secondary-100 text-secondary-700",
  dueSoon: "bg-amber-100 text-amber-800",
  scheduled: "bg-sky-100 text-sky-800",
  overdue: "bg-red-100 text-red-800",
  unknown: "bg-secondary-100 text-secondary-600",
};

function worstVaccinationStatus(
  statuses: VaccinationStatus[],
): VaccinationStatus {
  if (statuses.length === 0) return "unknown";
  if (statuses.includes("overdue")) return "overdue";
  if (statuses.includes("dueSoon")) return "dueSoon";
  if (statuses.includes("upToDate")) return "upToDate";
  return "unknown";
}

function StatusPill({ value, label }: { value: string; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[value] ?? statusTone.unknown}`}
    >
      {label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileHeart;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.015] px-5 py-9 text-center">
      <Icon className="mx-auto h-5 w-5 text-secondary-400" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-secondary-800">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-secondary-500">
        {body}
      </p>
    </div>
  );
}

export function PetPassportExperience({ petId }: { petId: string }) {
  const t = useTranslations("petPassport");
  const locale = useLocale();
  const router = useRouter();
  const [timelineFilter, setTimelineFilter] = useState<
    PassportTimelineType | "all"
  >("all");
  const passport = api.pets.passport.useQuery({ petId }, { retry: false });

  const data = passport.data;
  const timeline = useMemo(() => {
    if (!data) return [];
    const events = buildPassportTimeline(data.pet);
    return timelineFilter === "all"
      ? events
      : filterPassportTimeline(events, [timelineFilter]);
  }, [data, timelineFilter]);

  if (passport.isLoading) return <PassportSkeleton />;

  if (passport.isError || !data) {
    const unavailable = passport.error?.data?.code === "NOT_FOUND";
    return (
      <main className="passport-shell flex min-h-[75vh] items-center justify-center bg-[#efefeb] px-4 pt-20">
        <div className="max-w-md rounded-3xl border border-black/10 bg-[#f8f8f5] p-8 text-center">
          <AlertTriangle
            className="mx-auto h-7 w-7 text-primary-600"
            aria-hidden="true"
          />
          <h1 className="mt-5 text-2xl text-secondary-900">
            {unavailable ? t("notFoundTitle") : t("errorTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-secondary-600">
            {unavailable ? t("notFoundBody") : t("errorBody")}
          </p>
          {!unavailable && (
            <button
              type="button"
              onClick={() => void passport.refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t("retry")}
            </button>
          )}
        </div>
      </main>
    );
  }

  const { pet, petList, permissions } = data;
  const age = formatPetAge(pet.dateOfBirth, locale);
  const vaccinationStatus = worstVaccinationStatus(
    pet.vaccinations.map((vaccination) =>
      getVaccinationStatus(vaccination.nextDueAt),
    ),
  );
  const activePrescriptions = pet.prescriptions.filter(
    (prescription) =>
      getPrescriptionStatus(prescription.issuedAt, prescription.validUntil) ===
      "active",
  );
  const nextAppointment = pet.appointments
    .filter(
      (appointment) =>
        groupAppointment(appointment.status, appointment.scheduledAt) ===
        "upcoming",
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
  const weightChange = getWeightChange(pet.weightHistory);

  const speciesLabel = t(`species.${pet.species}` as Parameters<typeof t>[0]);
  const statusLabel = (status: string) =>
    t(`status.${status}` as Parameters<typeof t>[0]);

  return (
    <main className="passport-shell min-h-screen bg-[#efefeb] px-4 pb-20 pt-24 text-secondary-900 sm:px-6 lg:px-8">
      <PassportPrintView
        pet={pet}
        locale={locale}
        vaccinationStatus={vaccinationStatus}
        activePrescriptions={activePrescriptions}
        timeline={timeline.slice(0, 8)}
        t={t}
      />
      <div className="mx-auto max-w-[1440px] print:hidden">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-secondary-900 sm:text-4xl">
              {t("title")}
            </h1>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {permissions.canPrint && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-[#f8f8f5] px-3.5 text-sm font-semibold text-secondary-800 transition-colors hover:bg-white"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                {t("print")}
              </button>
            )}
            {permissions.canManageSharing && (
              <button
                type="button"
                disabled
                title={t("secureShareUnavailable")}
                className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-black/10 bg-black/[0.03] px-3.5 text-sm font-semibold text-secondary-400"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {t("secureShare")}
              </button>
            )}
          </div>
        </div>

        <div className="mb-5">
          <PassportActions
            petId={pet.id}
            petName={pet.name}
            profile={{
              breed: pet.breed,
              color: pet.color,
              dateOfBirth: pet.dateOfBirth,
              gender: pet.gender,
              isNeutered: pet.isNeutered,
              microchipId: pet.microchipId,
              notes: pet.notes,
            }}
            permissions={permissions}
          />
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="passport-print overflow-hidden rounded-[28px] border border-black/10 bg-secondary-900 text-white lg:sticky lg:top-24">
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary-800">
              {pet.avatarUrl ? (
                <img
                  src={pet.avatarUrl}
                  alt={t("petPhotoAlt", { name: pet.name })}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <PawPrint
                    className="h-14 w-14 text-white/35"
                    aria-hidden="true"
                  />
                </div>
              )}
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-secondary-950/80 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                <BadgeCheck
                  className="h-3.5 w-3.5 text-primary-300"
                  aria-hidden="true"
                />
                {t("identityRecord")}
              </div>
            </div>

            <div className="p-5">
              {petList.length > 1 ? (
                <Select.Root
                  value={pet.id}
                  onValueChange={(nextPetId) =>
                    router.push(`/dashboard/pets/${nextPetId}`)
                  }
                >
                  <Select.Trigger
                    aria-label={t("switchPet")}
                    className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-left text-sm outline-none hover:bg-white/10 focus:ring-2 focus:ring-primary-300"
                  >
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={6}
                      className="z-[100] min-w-[260px] overflow-hidden rounded-xl border border-black/10 bg-[#f8f8f5] p-1 shadow-xl"
                    >
                      <Select.Viewport>
                        {petList.map((option) => (
                          <Select.Item
                            key={option.id}
                            value={option.id}
                            className="relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm text-secondary-800 outline-none data-[highlighted]:bg-secondary-100"
                          >
                            <Select.ItemIndicator className="absolute left-3">
                              <Check className="h-4 w-4" />
                            </Select.ItemIndicator>
                            <Select.ItemText>{option.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              ) : (
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
                  {speciesLabel}
                </p>
              )}

              <h2 className="mt-5 text-[2rem] font-semibold tracking-[-0.04em] text-white">
                {pet.name}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {[pet.breed, age].filter(Boolean).join(" · ") || speciesLabel}
              </p>

              <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
                <IdentityRow
                  label={t("passportNumber")}
                  value={pet.passportNumber}
                  mono
                />
                <IdentityRow
                  label={t("microchip")}
                  value={pet.microchipId ?? t("notRecorded")}
                  mono={Boolean(pet.microchipId)}
                />
                <IdentityRow
                  label={t("owner")}
                  value={pet.owner.name ?? t("notRecorded")}
                />
                <IdentityRow
                  label={t("sex")}
                  value={
                    pet.gender
                      ? t(`gender.${pet.gender}` as Parameters<typeof t>[0])
                      : t("notRecorded")
                  }
                />
              </dl>

              <p className="mt-5 text-xs leading-5 text-white/45">
                {t("identityNote")}
              </p>
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="passport-print rounded-[28px] border border-black/10 bg-[#f8f8f5] p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-primary-700">
                    <Activity className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                      {t("careSnapshot")}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-secondary-900 sm:text-3xl">
                    {t("snapshotTitle", { name: pet.name })}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-secondary-600">
                    {t("snapshotBody")}
                  </p>
                </div>
                <div className="self-start">
                  <StatusPill
                    value={vaccinationStatus}
                    label={statusLabel(vaccinationStatus)}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border-t dark:border-[#30312e] border-[#d9d9d2] md:grid-cols-3 xl:grid-cols-6">
                <SnapshotItem
                  icon={Syringe}
                  label={t("vaccinations")}
                  value={statusLabel(vaccinationStatus)}
                />
                <SnapshotItem
                  icon={Pill}
                  label={t("medication")}
                  value={t("activeCount", {
                    count: activePrescriptions.length,
                  })}
                />
                <SnapshotItem
                  icon={Stethoscope}
                  label={t("lastVisit")}
                  value={
                    formatPassportDate(
                      pet.medicalRecords[0]?.visitDate,
                      locale,
                    ) ?? t("notRecorded")
                  }
                />
                <SnapshotItem
                  icon={CalendarDays}
                  label={t("nextAppointment")}
                  value={
                    formatPassportDate(nextAppointment?.scheduledAt, locale) ??
                    t("noneScheduled")
                  }
                />
                <SnapshotItem
                  icon={Weight}
                  label={t("currentWeight")}
                  value={pet.weight ? `${pet.weight} kg` : t("notRecorded")}
                  meta={
                    weightChange == null
                      ? undefined
                      : `${weightChange > 0 ? "+" : ""}${weightChange} kg`
                  }
                />
                <SnapshotItem
                  icon={Droplets}
                  label={t("bloodType")}
                  value={
                    pet.bloodType === "UNKNOWN"
                      ? t("unknown")
                      : pet.bloodType.replaceAll("_", " ")
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/15 bg-[#eee7d7] px-5 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-900"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-sm font-semibold text-amber-950">
                    {t("criticalInfo")}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-amber-950/65">
                    {t("criticalInfoEmpty")}
                  </p>
                </div>
              </div>
            </div>

            <Tabs.Root
              defaultValue="overview"
              className="rounded-[28px] border border-black/10 bg-[#f8f8f5]"
            >
              <div className="overflow-x-auto border-b border-black/10 px-2 no-scrollbar sm:px-5">
                <Tabs.List
                  aria-label={t("sections")}
                  className="flex min-w-max gap-1"
                >
                  {tabValues.map((tab) => (
                    <Tabs.Trigger
                      key={tab}
                      value={tab}
                      className="relative px-3 py-4 text-sm font-semibold text-secondary-500 outline-none transition-colors hover:text-secondary-900 focus-visible:ring-2 focus-visible:ring-primary-500 data-[state=active]:text-secondary-950 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary-600 after:opacity-0 data-[state=active]:after:opacity-100"
                    >
                      {t(`tabs.${tab}` as Parameters<typeof t>[0])}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </div>

              <div className="p-5 sm:p-7">
                <Tabs.Content value="overview" className="outline-none">
                  <OverviewTab
                    pet={pet}
                    locale={locale}
                    t={t}
                    timeline={timeline.slice(0, 4)}
                    nextAppointment={nextAppointment}
                  />
                </Tabs.Content>
                <Tabs.Content value="timeline" className="outline-none">
                  <TimelineTab
                    timeline={timeline}
                    filter={timelineFilter}
                    setFilter={setTimelineFilter}
                    locale={locale}
                    t={t}
                  />
                </Tabs.Content>
                <Tabs.Content value="vaccinations" className="outline-none">
                  <VaccinationsTab
                    vaccinations={pet.vaccinations}
                    locale={locale}
                    t={t}
                    statusLabel={statusLabel}
                  />
                </Tabs.Content>
                <Tabs.Content value="records" className="outline-none">
                  <RecordsTab
                    records={pet.medicalRecords}
                    locale={locale}
                    t={t}
                  />
                </Tabs.Content>
                <Tabs.Content value="prescriptions" className="outline-none">
                  <PrescriptionsTab
                    prescriptions={pet.prescriptions}
                    locale={locale}
                    t={t}
                    statusLabel={statusLabel}
                  />
                </Tabs.Content>
                <Tabs.Content value="appointments" className="outline-none">
                  <AppointmentsTab
                    appointments={pet.appointments}
                    locale={locale}
                    t={t}
                  />
                </Tabs.Content>
                <Tabs.Content value="tracking" className="outline-none">
                  <TrackingTab
                    weightHistory={pet.weightHistory}
                    reminders={pet.reminders}
                    locale={locale}
                    t={t}
                  />
                </Tabs.Content>
                <Tabs.Content value="documents" className="outline-none">
                  <DocumentsTab
                    records={pet.medicalRecords}
                    vaccinations={pet.vaccinations}
                    t={t}
                  />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </section>
        </div>
      </div>
    </main>
  );
}

type Translator = (key: any, values?: Record<string, any>) => string;

function IdentityRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-white/45">{label}</dt>
      <dd
        className={`max-w-[58%] break-words text-right text-white/85 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function SnapshotItem({
  icon: Icon,
  label,
  value,
  meta,
}: {
  icon: typeof Syringe;
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="bg-[#f8f8f5] px-4 py-4 first:pl-0 last:pr-0">
      <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
      <p className="mt-3 text-xs font-medium text-secondary-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-secondary-900">{value}</p>
      {meta && <p className="mt-0.5 text-xs text-secondary-500">{meta}</p>}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-secondary-900">
        {title}
      </h3>
    </div>
  );
}

function OverviewTab({
  pet,
  locale,
  t,
  timeline,
  nextAppointment,
}: {
  pet: any;
  locale: string;
  t: Translator;
  timeline: ReturnType<typeof buildPassportTimeline>;
  nextAppointment: any;
}) {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
      <div>
        <SectionHeading
          eyebrow={t("overview.identityEyebrow")}
          title={t("overview.identityTitle")}
        />
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <OverviewField
            label={t("speciesLabel")}
            value={t(`species.${pet.species}`)}
          />
          <OverviewField
            label={t("breed")}
            value={pet.breed ?? t("notRecorded")}
          />
          <OverviewField
            label={t("birthDate")}
            value={
              formatPassportDate(pet.dateOfBirth, locale) ?? t("notRecorded")
            }
          />
          <OverviewField
            label={t("neutered")}
            value={pet.isNeutered ? t("yes") : t("no")}
          />
          <OverviewField
            label={t("color")}
            value={pet.color ?? t("notRecorded")}
          />
          <OverviewField
            label={t("bloodType")}
            value={
              pet.bloodType === "UNKNOWN"
                ? t("unknown")
                : pet.bloodType.replaceAll("_", " ")
            }
          />
        </dl>
        <div className="mt-8">
          <SectionHeading
            eyebrow={t("overview.activityEyebrow")}
            title={t("overview.activityTitle")}
          />
          {timeline.length ? (
            <TimelineList timeline={timeline} locale={locale} t={t} />
          ) : (
            <EmptyState
              icon={FileHeart}
              title={t("emptyActivityTitle")}
              body={t("emptyActivityBody")}
            />
          )}
        </div>
      </div>
      <aside className="space-y-5">
        <div className="rounded-2xl bg-secondary-900 p-5 text-white">
          <Clock3 className="h-5 w-5 text-primary-300" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
            {t("nextAppointment")}
          </p>
          {nextAppointment ? (
            <>
              <p className="mt-2 font-semibold">
                {formatPassportDate(nextAppointment.scheduledAt, locale)}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {nextAppointment.clinic.name}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-white/60">{t("noneScheduled")}</p>
          )}
        </div>
        <div className="rounded-2xl border border-black/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-500">
            {t("donorStatus")}
          </p>
          <p className="mt-2 text-sm font-semibold text-secondary-900">
            {pet.bloodDonor
              ? t(`donor.${pet.bloodDonor.status}`)
              : t("donor.notRegistered")}
          </p>
          <p className="mt-1 text-sm leading-6 text-secondary-500">
            {t("donorBody")}
          </p>
        </div>
      </aside>
    </div>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-black/10 pb-4">
      <dt className="text-xs font-medium text-secondary-500">{label}</dt>
      <dd className="mt-1.5 text-sm font-semibold text-secondary-900">
        {value}
      </dd>
    </div>
  );
}

function TimelineTab({
  timeline,
  filter,
  setFilter,
  locale,
  t,
}: {
  timeline: ReturnType<typeof buildPassportTimeline>;
  filter: PassportTimelineType | "all";
  setFilter: (value: PassportTimelineType | "all") => void;
  locale: string;
  t: Translator;
}) {
  const filters: Array<PassportTimelineType | "all"> = [
    "all",
    "medicalRecord",
    "vaccination",
    "prescription",
    "appointment",
    "weight",
  ];
  return (
    <div>
      <SectionHeading
        eyebrow={t("timeline.eyebrow")}
        title={t("timeline.title")}
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${filter === value ? "bg-secondary-900 text-white" : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"}`}
          >
            {t(`timeline.filters.${value}`)}
          </button>
        ))}
      </div>
      {timeline.length ? (
        <TimelineList timeline={timeline} locale={locale} t={t} />
      ) : (
        <EmptyState
          icon={FileHeart}
          title={t("emptyActivityTitle")}
          body={t("emptyActivityBody")}
        />
      )}
    </div>
  );
}

function TimelineList({
  timeline,
  locale,
  t,
}: {
  timeline: ReturnType<typeof buildPassportTimeline>;
  locale: string;
  t: Translator;
}) {
  return (
    <ol className="relative ml-2 border-l border-black/10">
      {timeline.map((event) => (
        <li key={event.id} className="relative pb-7 pl-7 last:pb-0">
          <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-[3px] border-[#f8f8f5] bg-primary-600" />
          <div className="flex flex-col justify-between gap-1 sm:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                {t(`timeline.types.${event.type}`)}
              </p>
              <h4 className="mt-1 text-base font-semibold text-secondary-900">
                {event.title}
              </h4>
              {event.description && (
                <p className="mt-1 text-sm leading-6 text-secondary-600">
                  {event.description}
                </p>
              )}
              {event.meta && (
                <p className="mt-1 text-xs text-secondary-500">{event.meta}</p>
              )}
            </div>
            <time className="shrink-0 text-xs font-medium text-secondary-500">
              {formatPassportDate(event.occurredAt, locale)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

function VaccinationsTab({
  vaccinations,
  locale,
  t,
  statusLabel,
}: {
  vaccinations: any[];
  locale: string;
  t: Translator;
  statusLabel: (status: string) => string;
}) {
  return (
    <div>
      <SectionHeading
        eyebrow={t("vaccination.eyebrow")}
        title={t("vaccination.title")}
      />
      {vaccinations.length ? (
        <div className="divide-y divide-black/10">
          {vaccinations.map((vaccination) => {
            const status = getVaccinationStatus(vaccination.nextDueAt);
            return (
              <article
                key={vaccination.id}
                className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <h4 className="text-base font-semibold text-secondary-900">
                    {vaccination.vaccineName}
                  </h4>
                  <p className="mt-1 text-sm text-secondary-600">
                    {t("vaccination.administered", {
                      date:
                        formatPassportDate(
                          vaccination.administeredAt,
                          locale,
                        ) ?? "—",
                    })}
                  </p>
                  <p className="mt-1 text-sm text-secondary-500">
                    {vaccination.nextDueAt
                      ? t("vaccination.due", {
                          date:
                            formatPassportDate(vaccination.nextDueAt, locale) ??
                            "—",
                        })
                      : t("vaccination.noDueDate")}
                  </p>
                  {(vaccination.clinicName || vaccination.vetName) && (
                    <p className="mt-2 text-xs text-secondary-500">
                      {[vaccination.clinicName, vaccination.vetName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <StatusPill value={status} label={statusLabel(status)} />
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Syringe}
          title={t("vaccination.emptyTitle")}
          body={t("vaccination.emptyBody")}
        />
      )}
    </div>
  );
}

function RecordsTab({
  records,
  locale,
  t,
}: {
  records: any[];
  locale: string;
  t: Translator;
}) {
  return (
    <div>
      <SectionHeading
        eyebrow={t("records.eyebrow")}
        title={t("records.title")}
      />
      {records.length ? (
        <div className="divide-y divide-black/10">
          {records.map((record) => (
            <article key={record.id} className="py-5 first:pt-0">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                      {record.type.replaceAll("_", " ")}
                    </p>
                    {record.isPrivate && (
                      <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-600">
                        {t("records.private")}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 text-base font-semibold text-secondary-900">
                    {record.title}
                  </h4>
                </div>
                <time className="text-xs font-medium text-secondary-500">
                  {formatPassportDate(record.visitDate, locale)}
                </time>
              </div>
              {record.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary-600">
                  {record.description}
                </p>
              )}
              {(record.diagnosis || record.treatment) && (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {record.diagnosis && (
                    <div className="rounded-xl bg-secondary-100 p-3">
                      <dt className="text-xs font-semibold text-secondary-500">
                        {t("records.diagnosis")}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-secondary-800">
                        {record.diagnosis}
                      </dd>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="rounded-xl bg-secondary-100 p-3">
                      <dt className="text-xs font-semibold text-secondary-500">
                        {t("records.treatment")}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-secondary-800">
                        {record.treatment}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-500">
                {record.clinic?.name && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {record.clinic.name}
                  </span>
                )}
                {record.vet?.user?.name && (
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3.5 w-3.5" />
                    {record.vet.user.name}
                  </span>
                )}
                {record.attachments.length > 0 && (
                  <span>
                    {t("records.attachmentCount", {
                      count: record.attachments.length,
                    })}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileHeart}
          title={t("records.emptyTitle")}
          body={t("records.emptyBody")}
        />
      )}
    </div>
  );
}

function PrescriptionsTab({
  prescriptions,
  locale,
  t,
  statusLabel,
}: {
  prescriptions: any[];
  locale: string;
  t: Translator;
  statusLabel: (status: string) => string;
}) {
  return (
    <div>
      <SectionHeading
        eyebrow={t("prescriptions.eyebrow")}
        title={t("prescriptions.title")}
      />
      {prescriptions.length ? (
        <div className="space-y-3">
          {prescriptions.map((prescription) => {
            const status = getPrescriptionStatus(
              prescription.issuedAt,
              prescription.validUntil,
            );
            const drugs = Array.isArray(prescription.drugs)
              ? (prescription.drugs as Array<Record<string, unknown>>)
              : [];
            return (
              <article
                key={prescription.id}
                className="rounded-2xl border border-black/10 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-secondary-900">
                      {t("prescriptions.issuedBy", {
                        name: prescription.issuedBy,
                      })}
                    </h4>
                    <p className="mt-1 text-xs text-secondary-500">
                      {formatPassportDate(prescription.issuedAt, locale)}
                    </p>
                  </div>
                  <StatusPill value={status} label={statusLabel(status)} />
                </div>
                <div className="mt-4 space-y-2">
                  {drugs.map((drug, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-secondary-100 px-3.5 py-3"
                    >
                      <p className="text-sm font-semibold text-secondary-900">
                        {String(drug.name ?? t("unknown"))}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-secondary-600">
                        {[drug.dosage, drug.frequency, drug.duration]
                          .filter(Boolean)
                          .map(String)
                          .join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
                {prescription.instructions && (
                  <p className="mt-4 text-sm leading-6 text-secondary-600">
                    {prescription.instructions}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Pill}
          title={t("prescriptions.emptyTitle")}
          body={t("prescriptions.emptyBody")}
        />
      )}
    </div>
  );
}

function AppointmentsTab({
  appointments,
  locale,
  t,
}: {
  appointments: any[];
  locale: string;
  t: Translator;
}) {
  return (
    <div>
      <SectionHeading
        eyebrow={t("appointments.eyebrow")}
        title={t("appointments.title")}
      />
      {appointments.length ? (
        <div className="divide-y divide-black/10">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[180px_minmax(0,1fr)_auto]"
            >
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-700">
                  {t(
                    `appointments.groups.${groupAppointment(appointment.status, appointment.scheduledAt)}`,
                  )}
                </p>
                <time className="text-sm font-semibold text-secondary-900">
                  {formatPassportDateTime(appointment.scheduledAt, locale)}
                </time>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-secondary-900">
                  {appointment.clinic.name}
                </h4>
                <p className="mt-1 text-sm text-secondary-500">
                  {appointment.chiefComplaint ??
                    appointment.type.replaceAll("_", " ")}
                </p>
                {appointment.vet?.user?.name && (
                  <p className="mt-1 text-xs text-secondary-500">
                    {appointment.vet.user.name}
                  </p>
                )}
              </div>
              <StatusPill
                value={
                  appointment.status === "COMPLETED"
                    ? "completed"
                    : appointment.status === "CANCELLED"
                      ? "unknown"
                      : "scheduled"
                }
                label={appointment.status.replaceAll("_", " ")}
              />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={t("appointments.emptyTitle")}
          body={t("appointments.emptyBody")}
        />
      )}
    </div>
  );
}

function TrackingTab({
  weightHistory,
  reminders,
  locale,
  t,
}: {
  weightHistory: any[];
  reminders: any[];
  locale: string;
  t: Translator;
}) {
  const weights = [...weightHistory].sort(
    (a, b) => b.recordedAt.getTime() - a.recordedAt.getTime(),
  );
  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <section>
        <SectionHeading
          eyebrow={t("tracking.weightEyebrow")}
          title={t("tracking.weightTitle")}
        />
        {weights.length ? (
          <div className="divide-y divide-black/10">
            {weights.map((record) => (
              <div
                key={record.id}
                className="flex items-start justify-between gap-4 py-4 first:pt-0"
              >
                <div>
                  <p className="text-lg font-semibold tabular-nums text-secondary-900">
                    {record.weight} kg
                  </p>
                  {record.notes && (
                    <p className="mt-1 text-sm text-secondary-500">
                      {record.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <time className="text-xs font-medium text-secondary-500">
                    {formatPassportDate(record.recordedAt, locale)}
                  </time>
                  {record.recordedBy && (
                    <p className="mt-1 text-xs text-secondary-400">
                      {record.recordedBy}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Weight}
            title={t("tracking.emptyWeightTitle")}
            body={t("tracking.emptyWeightBody")}
          />
        )}
      </section>
      <section>
        <SectionHeading
          eyebrow={t("tracking.reminderEyebrow")}
          title={t("tracking.reminderTitle")}
        />
        {reminders.length ? (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <article
                key={reminder.id}
                className="flex items-start gap-3 rounded-xl border border-black/10 p-3.5"
              >
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-secondary-900">
                    {reminder.title}
                  </h4>
                  <p className="mt-1 text-xs text-secondary-500">
                    {formatPassportDateTime(reminder.dueAt, locale)} ·{" "}
                    {reminder.type.replaceAll("_", " ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock3}
            title={t("tracking.emptyReminderTitle")}
            body={t("tracking.emptyReminderBody")}
          />
        )}
      </section>
    </div>
  );
}

function DocumentsTab({
  records,
  vaccinations,
  t,
}: {
  records: any[];
  vaccinations: any[];
  t: Translator;
}) {
  const documents = [
    ...records.flatMap((record) =>
      record.attachments.map((url: string, index: number) => ({
        id: `${record.id}:${index}`,
        url,
        label: record.title,
        kind: t("documents.medicalAttachment"),
      })),
    ),
    ...vaccinations
      .filter((vaccination) => vaccination.certificateUrl)
      .map((vaccination) => ({
        id: `certificate:${vaccination.id}`,
        url: vaccination.certificateUrl as string,
        label: vaccination.vaccineName,
        kind: t("documents.vaccineCertificate"),
      })),
  ];
  return (
    <div>
      <SectionHeading
        eyebrow={t("documents.eyebrow")}
        title={t("documents.title")}
      />
      {documents.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((document) => (
            <a
              key={document.id}
              href={document.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-black/10 p-4 transition-colors hover:bg-secondary-100 focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <FileHeart className="h-5 w-5 text-primary-600" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-secondary-500">
                {document.kind}
              </p>
              <h4 className="mt-1 truncate text-sm font-semibold text-secondary-900 group-hover:text-primary-700">
                {document.label}
              </h4>
              <p className="mt-2 text-xs text-secondary-500">
                {t("documents.open")}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileHeart}
          title={t("documents.emptyTitle")}
          body={t("documents.emptyBody")}
        />
      )}
    </div>
  );
}

function PassportPrintView({
  pet,
  locale,
  vaccinationStatus,
  activePrescriptions,
  timeline,
  t,
}: {
  pet: any;
  locale: string;
  vaccinationStatus: VaccinationStatus;
  activePrescriptions: any[];
  timeline: ReturnType<typeof buildPassportTimeline>;
  t: Translator;
}) {
  return (
    <article className="mx-auto hidden max-w-4xl bg-white text-black print:block">
      <header className="flex items-start justify-between border-b-2 border-black pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            {t("title")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-black">{pet.name}</h1>
          <p className="mt-1 text-sm text-black/60">
            {[pet.breed, t(`species.${pet.species}`)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="text-right font-mono text-xs">
          <p>{t("passportNumber")}</p>
          <p className="mt-1 text-sm font-semibold">{pet.passportNumber}</p>
        </div>
      </header>
      <section className="grid grid-cols-4 gap-4 border-b border-black/20 py-5">
        <PrintFact
          label={t("microchip")}
          value={pet.microchipId ?? t("notRecorded")}
        />
        <PrintFact
          label={t("owner")}
          value={pet.owner.name ?? t("notRecorded")}
        />
        <PrintFact
          label={t("bloodType")}
          value={pet.bloodType.replaceAll("_", " ")}
        />
        <PrintFact
          label={t("currentWeight")}
          value={pet.weight ? `${pet.weight} kg` : t("notRecorded")}
        />
      </section>
      <section className="grid grid-cols-2 gap-8 py-6">
        <div>
          <h2 className="text-lg font-semibold text-black">
            {t("vaccination.title")}
          </h2>
          <p className="mt-1 text-sm">{t(`status.${vaccinationStatus}`)}</p>
          <div className="mt-4 space-y-3">
            {pet.vaccinations.slice(0, 6).map((vaccination: any) => (
              <div
                key={vaccination.id}
                className="border-t border-black/15 pt-2"
              >
                <p className="text-sm font-semibold">
                  {vaccination.vaccineName}
                </p>
                <p className="text-xs text-black/60">
                  {formatPassportDate(vaccination.administeredAt, locale)}
                  {vaccination.nextDueAt
                    ? ` · ${t("vaccination.due", { date: formatPassportDate(vaccination.nextDueAt, locale) ?? "—" })}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-black">
            {t("prescriptions.title")}
          </h2>
          <p className="mt-1 text-sm">
            {t("activeCount", { count: activePrescriptions.length })}
          </p>
          <div className="mt-4 space-y-3">
            {activePrescriptions.slice(0, 6).map((prescription) => (
              <div
                key={prescription.id}
                className="border-t border-black/15 pt-2"
              >
                <p className="text-sm font-semibold">{prescription.issuedBy}</p>
                <p className="text-xs text-black/60">
                  {formatPassportDate(prescription.issuedAt, locale)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-black/20 pt-6">
        <h2 className="text-lg font-semibold text-black">
          {t("timeline.title")}
        </h2>
        <ol className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
          {timeline.map((event) => (
            <li key={event.id} className="border-t border-black/15 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-black/55">
                {t(`timeline.types.${event.type}`)} ·{" "}
                {formatPassportDate(event.occurredAt, locale)}
              </p>
              <p className="mt-1 text-sm font-semibold">{event.title}</p>
            </li>
          ))}
        </ol>
      </section>
      <footer className="mt-8 border-t border-black pt-3 text-[10px] text-black/55">
        {t("printDisclaimer")}
      </footer>
    </article>
  );
}

function PrintFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-black/55">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function PassportSkeleton() {
  return (
    <div className="passport-shell min-h-screen bg-[#efefeb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] animate-pulse gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="h-[520px] rounded-[28px] bg-black/10" />
        <div className="space-y-5">
          <div className="h-64 rounded-[28px] bg-black/10" />
          <div className="h-20 rounded-2xl bg-black/10" />
          <div className="h-96 rounded-[28px] bg-black/10" />
        </div>
      </div>
    </div>
  );
}
