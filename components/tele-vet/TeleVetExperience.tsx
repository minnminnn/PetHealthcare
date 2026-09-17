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
import { Link } from "@/lib/navigation";

type PageLocale = "en" | "vi";
type Specialty =
  "all" | "internal" | "surgery" | "dermatology" | "exotic" | "reproduction";
type Species = "all" | "dog" | "cat" | "bird" | "reptile" | "rabbit";

const VETS = [
  {
    id: "v1",
    name: "BS. Nguyễn Minh Tuấn",
    specialty: ["internal"] as Specialty[],
    specialtyLabel: {
      en: "Internal medicine and cardiology",
      vi: "Nội khoa và tim mạch",
    },
    experience: 12,
    price: 150000,
    available: true,
    nextSlot: { en: "Today, 14:30", vi: "Hôm nay, 14:30" },
    species: ["dog", "cat"] as Species[],
    languages: ["Tiếng Việt", "English"],
  },
  {
    id: "v2",
    name: "BS. Trần Thị Lan Anh",
    specialty: ["exotic", "dermatology"] as Specialty[],
    specialtyLabel: {
      en: "Exotic pets and dermatology",
      vi: "Thú ngoại lai và da liễu",
    },
    experience: 8,
    price: 180000,
    available: true,
    nextSlot: { en: "Today, 16:00", vi: "Hôm nay, 16:00" },
    species: ["bird", "reptile", "rabbit"] as Species[],
    languages: ["Tiếng Việt"],
  },
  {
    id: "v3",
    name: "BS. Lê Hồng Phúc",
    specialty: ["surgery"] as Specialty[],
    specialtyLabel: {
      en: "Surgery and orthopaedics",
      vi: "Phẫu thuật và chỉnh hình",
    },
    experience: 15,
    price: 250000,
    available: false,
    nextSlot: { en: "Tomorrow, 09:00", vi: "Ngày mai, 09:00" },
    species: ["dog", "cat"] as Species[],
    languages: ["Tiếng Việt", "English"],
  },
  {
    id: "v4",
    name: "BS. Phạm Thu Hiền",
    specialty: ["reproduction"] as Specialty[],
    specialtyLabel: {
      en: "Reproduction and maternity care",
      vi: "Sản khoa và sinh sản",
    },
    experience: 6,
    price: 120000,
    available: true,
    nextSlot: { en: "Today, 15:00", vi: "Hôm nay, 15:00" },
    species: ["dog", "cat"] as Species[],
    languages: ["Tiếng Việt"],
  },
] as const;

const COPY = {
  en: {
    eyebrow: "ONLINE VETERINARY CARE",
    title: "Veterinary care, now.",
    intro:
      "Talk with a veterinary professional from home and decide the right next step for your pet.",
    findVet: "Find a vet",
    prepare: "Prepare for a call",
    imageAlt: "A veterinarian examining a dog with its owner",
    verified: "Verified veterinary profiles",
    secure: "Private video sessions",
    support: "Clear follow-up guidance",
    directoryEyebrow: "AVAILABLE CARE",
    directoryTitle: "Choose the right clinician",
    directoryBody:
      "Filter by care area and species. Availability is shown before you choose.",
    specialtyLabel: "Care area",
    speciesLabel: "Pet",
    results: (count: number) =>
      `${count} ${count === 1 ? "clinician" : "clinicians"}`,
    noResults: "No clinicians match these filters yet.",
    reset: "Clear filters",
    available: "Available",
    busy: "Next opening",
    years: "years of experience",
    next: "Next session",
    session: "per session",
    book: "Continue with your pet",
    unavailable: "Not available",
    processEyebrow: "BEFORE THE CALL",
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
        title: "Join from a quiet place",
        body: "Use stable internet and keep your pet safely within reach.",
      },
    ],
    paymentTitle: "Simple payment. Clear expectations.",
    paymentBody:
      "Choose a session first. Payment and cancellation details appear before confirmation.",
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
    eyebrow: "TƯ VẤN THÚ Y TRỰC TUYẾN",
    title: "Bác sĩ thú y, luôn gần bạn.",
    intro:
      "Trao đổi với bác sĩ ngay tại nhà và chọn bước chăm sóc phù hợp cho thú cưng.",
    findVet: "Tìm bác sĩ",
    prepare: "Chuẩn bị cuộc gọi",
    imageAlt: "Bác sĩ thú y đang khám cho chó cùng chủ nuôi",
    verified: "Hồ sơ bác sĩ đã xác minh",
    secure: "Cuộc gọi video riêng tư",
    support: "Hướng dẫn theo dõi rõ ràng",
    directoryEyebrow: "LỊCH TƯ VẤN",
    directoryTitle: "Chọn bác sĩ phù hợp",
    directoryBody:
      "Lọc theo chuyên khoa và loài thú cưng. Lịch trống được hiển thị trước khi bạn chọn.",
    specialtyLabel: "Chuyên khoa",
    speciesLabel: "Thú cưng",
    results: (count: number) => `${count} bác sĩ`,
    noResults: "Chưa có bác sĩ phù hợp với bộ lọc này.",
    reset: "Xóa bộ lọc",
    available: "Sẵn sàng",
    busy: "Lịch gần nhất",
    years: "năm kinh nghiệm",
    next: "Buổi gần nhất",
    session: "mỗi buổi",
    book: "Tiếp tục với thú cưng",
    unavailable: "Chưa khả dụng",
    processEyebrow: "TRƯỚC CUỘC GỌI",
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
        title: "Chọn nơi yên tĩnh",
        body: "Dùng mạng ổn định và giữ thú cưng an toàn trong tầm tay.",
      },
    ],
    paymentTitle: "Thanh toán đơn giản. Thông tin minh bạch.",
    paymentBody:
      "Chọn buổi tư vấn trước. Chi phí và điều kiện hủy sẽ hiện trước khi xác nhận.",
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

  const visibleVets = useMemo(
    () =>
      VETS.filter(
        (vet) =>
          (specialty === "all" || vet.specialty.includes(specialty)) &&
          (pet === "all" || vet.species.includes(pet)),
      ),
    [pet, specialty],
  );

  const clearFilters = () => {
    setSpecialty("all");
    setPet("all");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#efefeb] text-[#20211f] dark:bg-[#151614] dark:text-[#f1f1ed]">
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
              {specialties.map((item) => (
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
                      <p className="flex items-center gap-1.5 text-xs text-[#62635f] dark:text-[#b6b7b2]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {copy.next}: {vet.nextSlot[locale]}
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {vet.price.toLocaleString(
                          locale === "vi" ? "vi-VN" : "en-US",
                        )}
                        ₫{" "}
                        <span className="text-xs font-normal text-[#62635f] dark:text-[#b6b7b2]">
                          / {copy.session}
                        </span>
                      </p>
                    </div>
                    {vet.available ? (
                      <Link
                        id={`book-vet-${vet.id}`}
                        href="/dashboard/pets"
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
