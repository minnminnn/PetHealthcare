"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  ShieldCheck,
  Stethoscope,
  Video,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Link } from "@/lib/navigation";
import { getClinicDisplayName } from "@/lib/care/display";

type PageLocale = "en" | "vi";
type Specialty =
  "all" | "internal" | "surgery" | "dermatology" | "exotic" | "reproduction";
type Species = "all" | "dog" | "cat" | "bird" | "reptile" | "rabbit";

const COPY = {
  en: {
    eyebrow: "VETERINARY APPOINTMENTS",
    title: "Veterinary care, now.",
    intro:
      "Find a veterinary professional and request an appointment for your pet.",
    findVet: "Find a vet",
    prepare: "Prepare for your visit",
    imageAlt: "A veterinarian examining a dog with its owner",
    verified: "Verified veterinary profiles",
    secure: "Clinic appointment requests",
    support: "Clear follow-up guidance",
    directoryEyebrow: "AVAILABLE CARE",
    directoryTitle: "Choose the right clinician",
    directoryBody:
      "Filter clinicians by pet species and choose a clinic to request an appointment.",
    specialtyLabel: "Care area",
    speciesLabel: "Pet",
    results: (count: number) =>
      `${count} ${count === 1 ? "clinician" : "clinicians"}`,
    noResults: "No clinicians match these filters yet.",
    reset: "Clear filters",
    available: "Accepting requests",
    busy: "Next opening",
    years: "years of experience",
    next: "Next session",
    session: "per session",
    book: "Request an appointment",
    unavailable: "Not available",
    processEyebrow: "BEFORE THE VISIT",
    processTitle: "A calmer consultation starts with a little context.",
    process: [
      {
        title: "Add your pet",
        body: "Keep their species, age, weight and current medicine ready.",
      },
      {
        title: "Describe the concern",
        body: "Note when it started and upload a clear photo when helpful.",
      },
      {
        title: "Prepare for transport",
        body: "Contact the clinic to confirm your appointment and transport your pet safely.",
      },
    ],
    paymentTitle: "Confirm fees with your clinic.",
    paymentBody:
      "Your clinic confirms fees directly. Online checkout is not available.",
    dashboard: "Review your pet profile",
    filters: {
      specialty: {
        all: "All care",
        internal: "Internal medicine",
        surgery: "Surgery",
        dermatology: "Dermatology",
        exotic: "Exotic pets",
        reproduction: "Reproduction",
      },
      species: {
        all: "All pets",
        dog: "Dog",
        cat: "Cat",
        bird: "Bird",
        reptile: "Reptile",
        rabbit: "Rabbit",
      },
    },
  },
  vi: {
    eyebrow: "ĐẶT LỊCH VỚI BÁC SĨ THÚ Y",
    title: "Bác sĩ thú y, luôn gần bạn.",
    intro: "Tìm bác sĩ đã được xác minh và gửi yêu cầu đặt lịch cho thú cưng.",
    findVet: "Tìm bác sĩ",
    prepare: "Chuẩn bị buổi khám",
    imageAlt: "Bác sĩ thú y đang khám cho chó cùng chủ nuôi",
    verified: "Hồ sơ bác sĩ đã xác minh",
    secure: "Yêu cầu lịch tại phòng khám",
    support: "Hướng dẫn theo dõi rõ ràng",
    directoryEyebrow: "LỊCH TƯ VẤN",
    directoryTitle: "Chọn bác sĩ phù hợp",
    directoryBody:
      "Lọc bác sĩ theo loài thú cưng và chọn phòng khám để gửi yêu cầu đặt lịch.",
    specialtyLabel: "Chuyên khoa",
    speciesLabel: "Thú cưng",
    results: (count: number) => `${count} bác sĩ`,
    noResults: "Chưa có bác sĩ phù hợp với bộ lọc này.",
    reset: "Xóa bộ lọc",
    available: "Nhận yêu cầu",
    busy: "Lịch gần nhất",
    years: "năm kinh nghiệm",
    next: "Buổi gần nhất",
    session: "mỗi buổi",
    book: "Đặt lịch khám",
    unavailable: "Chưa khả dụng",
    processEyebrow: "TRƯỚC BUỔI KHÁM",
    processTitle: "Một chút chuẩn bị giúp buổi tư vấn rõ ràng hơn.",
    process: [
      {
        title: "Thêm thú cưng",
        body: "Chuẩn bị loài, tuổi, cân nặng và thuốc đang sử dụng.",
      },
      {
        title: "Mô tả vấn đề",
        body: "Ghi lại thời điểm bắt đầu và tải ảnh rõ nét khi cần.",
      },
      {
        title: "Chuẩn bị di chuyển",
        body: "Liên hệ phòng khám để xác nhận lịch và chuẩn bị vận chuyển thú cưng an toàn.",
      },
    ],
    paymentTitle: "Xác nhận chi phí với phòng khám.",
    paymentBody:
      "Phòng khám xác nhận chi phí trực tiếp. Thanh toán trực tuyến chưa được kích hoạt.",
    dashboard: "Xem hồ sơ thú cưng",
    filters: {
      specialty: {
        all: "Tất cả",
        internal: "Nội khoa",
        surgery: "Ngoại khoa",
        dermatology: "Da liễu",
        exotic: "Thú ngoại lai",
        reproduction: "Sản khoa",
      },
      species: {
        all: "Mọi loài",
        dog: "Chó",
        cat: "Mèo",
        bird: "Chim",
        reptile: "Bò sát",
        rabbit: "Thỏ",
      },
    },
  },
} as const;

const specialties: Specialty[] = [
  "all",
  "internal",
  "surgery",
  "dermatology",
  "exotic",
  "reproduction",
];
const species: Species[] = ["all", "dog", "cat", "bird", "reptile", "rabbit"];

export function TeleVetExperience({ locale }: { locale: PageLocale }) {
  const copy = COPY[locale];
  const [specialty, setSpecialty] = useState<Specialty>("all");
  const [pet, setPet] = useState<Species>("all");

  const directory = api.management.bookingOptions.useQuery();
  const vets = useMemo(
    () =>
      (directory.data ?? []).flatMap((clinic) =>
        clinic.vets.map((vet) => ({
          id: vet.id,
          clinicId: clinic.id,
          name: vet.user.name ?? (locale === "vi" ? "Bác sĩ" : "Veterinarian"),
          specialty: [] as Specialty[],
          specialtyLabel: {
            vi: getClinicDisplayName(clinic.name),
            en: getClinicDisplayName(clinic.name),
          },
          experience: vet.yearsExperience,
          available: true,
          species: vet.specializations.map((value) =>
            value.toLowerCase(),
          ) as Species[],
          languages: [] as string[],
        })),
      ),
    [directory.data, locale],
  );
  const visibleVets = useMemo(
    () =>
      vets.filter(
        (vet) =>
          (specialty === "all" || vet.specialty.includes(specialty)) &&
          (pet === "all" || vet.species.includes(pet)),
      ),
    [pet, specialty, vets],
  );

  const clearFilters = () => {
    setSpecialty("all");
    setPet("all");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#efefeb] text-[#20211f] dark:bg-[#151614] dark:text-[#f1f1ed]">
      <div className="mx-auto max-w-6xl px-4 pt-24 text-sm" role="status">
        <p className="rounded-xl border border-black/15 p-4 dark:border-white/20">
          {locale === "vi"
            ? "Danh sách bác sĩ lấy từ phòng khám đã duyệt. Hiện hỗ trợ đặt lịch khám trực tiếp; gọi video và thanh toán trực tuyến chưa được kích hoạt."
            : "These clinicians belong to approved clinics. In-person booking is available; video calls and online payment are not enabled."}
        </p>
        {directory.isLoading && (
          <p className="mt-4">
            {locale === "vi" ? "Đang tải bác sĩ…" : "Loading clinicians…"}
          </p>
        )}
        {directory.isError && (
          <p className="mt-4" role="alert">
            {locale === "vi"
              ? "Không tải được danh sách bác sĩ."
              : "Could not load clinicians."}{" "}
            <button
              className="underline"
              onClick={() => void directory.refetch()}
            >
              {locale === "vi" ? "Thử lại" : "Retry"}
            </button>
          </p>
        )}
      </div>
      <section className="px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-8 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-[#b9473e] dark:text-[#ef7569]">
              {copy.eyebrow}
            </p>
            <h1 className="max-w-[14ch] text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl dark:text-[#f1f1ed]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#62635f] dark:text-[#b6b7b2] sm:text-lg">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#clinicians"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#20211f] px-5 text-sm font-semibold text-[#f8f8f5] transition-colors hover:bg-[#b9473e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] focus-visible:ring-offset-2 dark:bg-[#ef7569] dark:text-[#151614] dark:hover:bg-[#f08b82]"
              >
                {copy.findVet}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#prepare"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#ccccc5] px-5 text-sm font-semibold transition-colors hover:bg-[#f8f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] dark:border-[#3b3c38] dark:hover:bg-[#20211f]"
              >
                {copy.prepare}
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#deded8] dark:bg-[#20211f]">
            <Image
              src="/images/petcare-consultation.webp"
              alt={copy.imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#d9d9d2] px-4 dark:border-[#30312e] sm:px-6 lg:px-8"
        aria-label="Consultation standards"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-[#d9d9d2] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#30312e]">
          {[
            [ShieldCheck, copy.verified],
            [Video, copy.secure],
            [Headphones, copy.support],
          ].map(([Icon, label]) => {
            const StandardIcon = Icon as LucideIcon;
            return (
              <div
                key={label as string}
                className="flex items-center gap-3 py-5 sm:px-5 sm:first:pl-0"
              >
                <StandardIcon
                  className="h-5 w-5 text-[#b9473e] dark:text-[#ef7569]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{label as string}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="clinicians"
        className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#b9473e] dark:text-[#ef7569]">
              {copy.directoryEyebrow}
            </p>
            <h2 className="mt-4  text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl dark:text-[#f1f1ed]">
              {copy.directoryTitle}
            </h2>
          </div>

          <div className="mt-12 border-y border-[#d9d9d2] py-5 dark:border-[#30312e]">
            <FilterRow label={copy.specialtyLabel} icon={Stethoscope}>
              {specialties
                .filter((value) => value === "all")
                .map((item) => (
                  <FilterButton
                    key={item}
                    active={specialty === item}
                    onClick={() => setSpecialty(item)}
                  >
                    {copy.filters.specialty[item]}
                  </FilterButton>
                ))}
            </FilterRow>
            <FilterRow
              label={copy.speciesLabel}
              icon={CheckCircle2}
              className="mt-4"
            >
              {species.map((item) => (
                <FilterButton
                  key={item}
                  active={pet === item}
                  onClick={() => setPet(item)}
                >
                  {copy.filters.species[item]}
                </FilterButton>
              ))}
            </FilterRow>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">
              {copy.results(visibleVets.length)}
            </p>
            {(specialty !== "all" || pet !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[#b9473e] underline decoration-[#b9473e]/30 underline-offset-4 hover:decoration-[#b9473e] dark:text-[#ef7569]"
              >
                {copy.reset}
              </button>
            )}
          </div>

          {visibleVets.length > 0 ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {visibleVets.map((vet) => (
                <article
                  key={vet.id}
                  className="flex h-full flex-col rounded-2xl border border-[#d9d9d2] bg-[#f8f8f5] p-6 dark:border-[#30312e] dark:bg-[#20211f] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#b9473e] dark:text-[#ef7569]">
                        {vet.specialtyLabel[locale]}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] dark:text-[#f1f1ed]">
                        {vet.name}
                      </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#62635f] dark:text-[#b6b7b2]">
                      {vet.available ? (
                        <CheckCircle2 className="h-4 w-4 text-[#b9473e] dark:text-[#ef7569]" />
                      ) : (
                        <Clock3 className="h-4 w-4" />
                      )}
                      {vet.available ? copy.available : copy.busy}
                    </span>
                  </div>
                  <p className="mt-5 text-sm text-[#62635f] dark:text-[#b6b7b2]">
                    {vet.experience} {copy.years}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {vet.species.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#d9d9d2] px-3 py-1 text-xs font-medium dark:border-[#3b3c38]"
                      >
                        {copy.filters.species[item]}
                      </span>
                    ))}
                    {vet.languages.map((language) => (
                      <span
                        key={language}
                        className="rounded-full bg-[#e8e8e2] px-3 py-1 text-xs font-medium text-[#62635f] dark:bg-[#2b2c29] dark:text-[#b6b7b2]"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col gap-5 border-t border-[#d9d9d2] pt-6 dark:border-[#30312e] sm:mt-7 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm text-[#62635f] dark:text-[#b6b7b2]">
                        {locale === "vi"
                          ? "Phòng khám xác nhận thời gian và chi phí sau khi nhận yêu cầu."
                          : "The clinic confirms the time and fee after receiving your request."}
                      </p>
                    </div>
                    {vet.available ? (
                      <Link
                        id={`book-vet-${vet.id}`}
                        href={`/dashboard/appointments?clinicId=${encodeURIComponent(vet.clinicId)}&vetId=${encodeURIComponent(vet.id)}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#20211f] px-4 text-sm font-semibold text-[#f8f8f5] transition-colors hover:bg-[#b9473e] dark:bg-[#ef7569] dark:text-[#151614] dark:hover:bg-[#f08b82]"
                      >
                        <Video className="h-4 w-4" />
                        {copy.book}
                      </Link>
                    ) : (
                      <button
                        id={`book-vet-${vet.id}`}
                        type="button"
                        disabled
                        className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#deded8] px-4 text-sm font-semibold text-[#858680] dark:bg-[#30312e] dark:text-[#6f706b]"
                      >
                        <Video className="h-4 w-4" />
                        {copy.unavailable}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#c4c4bd] px-6 py-16 text-center dark:border-[#3b3c38]">
              <p className="text-[#62635f] dark:text-[#b6b7b2]">
                {copy.noResults}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-[#b9473e] dark:text-[#ef7569]"
              >
                {copy.reset}
              </button>
            </div>
          )}
        </div>
      </section>

      <section
        id="prepare"
        className="scroll-mt-24 bg-[#20211f] px-4 py-20 text-[#f1f1ed] dark:bg-[#edede7] dark:text-[#20211f] sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#ef7569] dark:text-[#b9473e]">
                {copy.processEyebrow}
              </p>
              <h2 className="mt-4 max-w-[15ch] text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-5xl">
                {copy.processTitle}
              </h2>
            </div>
            <div className="grid gap-8 border-t border-white/15 pt-7 sm:grid-cols-3 dark:border-black/15">
              {copy.process.map((item, index) => (
                <div key={item.title}>
                  <span className="text-xs font-semibold text-[#ef7569] dark:text-[#b9473e]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#b6b7b2] dark:text-[#62635f]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-2xl border border-[#d9d9d2] bg-[#f8f8f5] p-6 dark:border-[#30312e] dark:bg-[#20211f] sm:p-8 md:flex-row md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eee0dc] text-[#b9473e] dark:bg-[#3c2926] dark:text-[#ef7569]">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold tracking-[-0.025em] dark:text-[#f1f1ed]">
              {copy.paymentTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#62635f] dark:text-[#b6b7b2]">
              {copy.paymentBody}
            </p>
          </div>
          <Link
            href="/dashboard/pets"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ccccc5] px-4 text-sm font-semibold transition-colors hover:bg-[#efefeb] dark:border-[#3b3c38] dark:hover:bg-[#2b2c29]"
          >
            <CalendarDays className="h-4 w-4" />
            {copy.dashboard}
          </Link>
        </div>
      </section>
    </main>
  );
}

function FilterRow({
  label,
  icon: Icon,
  className = "",
  children,
}: {
  label: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-3 lg:flex-row lg:items-center ${className}`}
    >
      <span className="flex min-w-28 items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#62635f] dark:text-[#b6b7b2]">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] ${active ? "bg-[#20211f] text-[#f8f8f5] dark:bg-[#ef7569] dark:text-[#151614]" : "border border-[#d9d9d2] bg-transparent text-[#62635f] hover:border-[#a8a8a1] hover:text-[#20211f] dark:border-[#3b3c38] dark:text-[#b6b7b2] dark:hover:text-[#f1f1ed]"}`}
    >
      {children}
    </button>
  );
}
