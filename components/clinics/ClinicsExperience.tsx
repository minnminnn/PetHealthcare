"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Link } from "@/lib/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Locale = "vi" | "en";
type Species = "all" | "dog" | "cat" | "bird" | "reptile" | "exotic";
type ClinicStatus = "available" | "emergency" | "busy" | "closed";

interface Clinic {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance: number;
  is24h: boolean;
  isVerified: boolean;
  status: ClinicStatus;
  phone: string;
  image: string;
  species: Exclude<Species, "all">[];
  services: Record<Locale, string[]>;
}

const CLINICS: Clinic[] = [
  {
    id: "1",
    name: "Phòng khám Quốc Tế Sài Gòn Pet",
    address: "45 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    rating: 4.9,
    reviews: 1203,
    distance: 0.8,
    is24h: true,
    isVerified: true,
    status: "available",
    phone: "028 3823 xxxx",
    image: "/images/petcare-consultation.webp",
    species: ["dog", "cat", "bird", "exotic"],
    services: {
      vi: ["Khám tổng quát", "Cấp cứu", "Chẩn đoán hình ảnh"],
      en: ["General care", "Emergency", "Diagnostic imaging"],
    },
  },
  {
    id: "2",
    name: "Animal Care Center Hà Nội",
    address: "12 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
    rating: 4.8,
    reviews: 842,
    distance: 1.4,
    is24h: true,
    isVerified: true,
    status: "emergency",
    phone: "024 3828 xxxx",
    image: "/images/petcare-hero.webp",
    species: ["dog", "cat", "reptile"],
    services: {
      vi: ["Trực cấp cứu", "Phẫu thuật", "Xét nghiệm"],
      en: ["Emergency care", "Surgery", "Laboratory"],
    },
  },
  {
    id: "3",
    name: "PetVet Đà Nẵng",
    address: "78 Lê Duẩn, Hải Châu, Đà Nẵng",
    rating: 4.7,
    reviews: 456,
    distance: 2.1,
    is24h: false,
    isVerified: true,
    status: "busy",
    phone: "0236 382 xxxx",
    image: "/images/petcare-passport.webp",
    species: ["dog", "cat", "bird", "reptile", "exotic"],
    services: {
      vi: ["Thú ngoại lai", "Tiêm phòng", "Hộ chiếu số"],
      en: ["Exotic pets", "Vaccination", "Digital records"],
    },
  },
  {
    id: "4",
    name: "Phòng khám Thú Y Hòa Bình",
    address: "234 Cách Mạng Tháng 8, Q.3, TP.HCM",
    rating: 4.6,
    reviews: 318,
    distance: 3,
    is24h: false,
    isVerified: false,
    status: "available",
    phone: "028 3957 xxxx",
    image: "/images/petcare-consultation.webp",
    species: ["dog", "cat"],
    services: {
      vi: ["Khám tổng quát", "Nha khoa", "Chăm sóc tại nhà"],
      en: ["General care", "Dental care", "Home visits"],
    },
  },
];

const COPY = {
  vi: {
    breadcrumbHome: "Trang chủ",
    breadcrumbCurrent: "Phòng khám",
    eyebrow: "Phòng khám quanh bạn",
    title: "Tìm nơi chăm sóc phù hợp, gần bạn.",
    description: "So sánh chuyên môn, giờ mở cửa và đánh giá trước khi đặt lịch.",
    searchPlaceholder: "Tên phòng khám, khu vực hoặc dịch vụ",
    searchLabel: "Tìm kiếm phòng khám",
    filters: "Bộ lọc",
    species: "Loài thú cưng",
    status: "Trạng thái",
    sort: "Sắp xếp",
    sortDistance: "Gần nhất",
    sortRating: "Đánh giá cao",
    allStatuses: "Tất cả trạng thái",
    result: "phòng khám phù hợp",
    verified: "Đã xác minh",
    reviews: "đánh giá",
    details: "Xem chi tiết",
    call: "Gọi phòng khám",
    openAllDay: "Mở cửa 24/7",
    mapTitle: "Vị trí phòng khám",
    mapDescription: "Chọn một phòng khám trong danh sách để xem vị trí và thông tin nhanh.",
    mapPending: "Bản đồ tương tác đang được kết nối",
    selected: "Đang chọn",
    emptyTitle: "Chưa tìm thấy phòng khám phù hợp",
    emptyBody: "Thử đổi từ khóa hoặc chọn lại bộ lọc.",
    clear: "Xóa bộ lọc",
  },
  en: {
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Clinics",
    eyebrow: "Care near you",
    title: "Find the right care, close to home.",
    description: "Compare expertise, opening hours, and community feedback before booking.",
    searchPlaceholder: "Clinic name, area, or service",
    searchLabel: "Search clinics",
    filters: "Filters",
    species: "Pet type",
    status: "Status",
    sort: "Sort",
    sortDistance: "Nearest",
    sortRating: "Top rated",
    allStatuses: "All statuses",
    result: "matching clinics",
    verified: "Verified",
    reviews: "reviews",
    details: "View details",
    call: "Call clinic",
    openAllDay: "Open 24/7",
    mapTitle: "Clinic locations",
    mapDescription: "Select a clinic from the list to see its location and key details.",
    mapPending: "Interactive map connection in progress",
    selected: "Selected",
    emptyTitle: "No matching clinics yet",
    emptyBody: "Try another search term or reset the filters.",
    clear: "Clear filters",
  },
} as const;

const SPECIES: Array<{ id: Species; label: Record<Locale, string> }> = [
  { id: "all", label: { vi: "Tất cả", en: "All" } },
  { id: "dog", label: { vi: "Chó", en: "Dogs" } },
  { id: "cat", label: { vi: "Mèo", en: "Cats" } },
  { id: "bird", label: { vi: "Chim", en: "Birds" } },
  { id: "reptile", label: { vi: "Bò sát", en: "Reptiles" } },
  { id: "exotic", label: { vi: "Thú ngoại lai", en: "Exotic pets" } },
];

const STATUS: Record<ClinicStatus, Record<Locale, string>> = {
  available: { vi: "Đang mở cửa", en: "Open now" },
  emergency: { vi: "Trực cấp cứu", en: "Emergency care" },
  busy: { vi: "Đang đông", en: "Currently busy" },
  closed: { vi: "Đã đóng cửa", en: "Closed" },
};

function formatReviews(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(value);
}

export function ClinicsExperience({ locale }: { locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const copy = COPY[locale];
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState<Species>("all");
  const [status, setStatus] = useState<ClinicStatus | "all">("all");
  const [sort, setSort] = useState<"distance" | "rating">("distance");
  const [selectedId, setSelectedId] = useState(CLINICS[0].id);

  useGSAP(
    () => {
      if (reduceMotion) return;

      gsap.fromTo(
        "[data-clinic-hero] > *",
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: "power3.out" },
      );

      gsap.utils.toArray<HTMLElement>("[data-clinic-row]").forEach((row) => {
        const image = row.querySelector<HTMLElement>("[data-clinic-image]");

        gsap.from(row, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 88%", once: true },
        });

        if (image) {
          gsap.fromTo(
            image,
            { scale: 0.88, opacity: 0.55 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top 90%",
                end: "bottom 30%",
                scrub: 0.7,
              },
            },
          );
        }
      });
    },
    { scope: root, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  const filteredClinics = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);

    return CLINICS.filter((clinic) => {
      const services = clinic.services[locale].join(" ").toLocaleLowerCase(locale);
      const matchesQuery =
        !normalizedQuery ||
        clinic.name.toLocaleLowerCase(locale).includes(normalizedQuery) ||
        clinic.address.toLocaleLowerCase(locale).includes(normalizedQuery) ||
        services.includes(normalizedQuery);
      const matchesSpecies = species === "all" || clinic.species.includes(species);
      const matchesStatus = status === "all" || clinic.status === status;

      return matchesQuery && matchesSpecies && matchesStatus;
    }).sort((a, b) =>
      sort === "distance" ? a.distance - b.distance : b.rating - a.rating,
    );
  }, [locale, query, sort, species, status]);

  const selectedClinic =
    CLINICS.find((clinic) => clinic.id === selectedId) ?? CLINICS[0];

  const clearFilters = () => {
    setQuery("");
    setSpecies("all");
    setStatus("all");
    setSort("distance");
  };

  return (
    <main
      ref={root}
      className="w-full max-w-full overflow-x-hidden bg-[#f3f3f0] text-[#20211f] dark:bg-[#171816] dark:text-[#f1f1ed]"
    >
      <section className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-7xl overflow-hidden rounded-2xl bg-[#deded8] dark:bg-[#242523] lg:grid-cols-[1.08fr_.92fr]">
          <div
            data-clinic-hero
            className="flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12"
          >
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-[#676964] dark:text-[#b7b8b2]"
            >
              <Link
                href="/"
                className="transition-colors hover:text-[#b9473e] dark:hover:text-[#ef7569]"
              >
                {copy.breadcrumbHome}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#20211f] dark:text-[#f1f1ed]">
                {copy.breadcrumbCurrent}
              </span>
            </nav>

            <div className="my-16 lg:my-10">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#b9473e] dark:text-[#ef7569]">
                {copy.eyebrow}
              </p>
              <h1 className="max-w-4xl text-balance text-[clamp(2.75rem,5.5vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#20211f] dark:text-[#f1f1ed]">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-[#676964] dark:text-[#b7b8b2] sm:text-lg">
                {copy.description}
              </p>
            </div>

            <div>
              <label className="group flex min-h-14 items-center gap-3 rounded-xl border border-[#babbb4] bg-[#f3f3f0] px-4 transition-colors focus-within:border-[#b9473e] focus-within:ring-4 focus-within:ring-[#d85f53]/15 dark:border-white/15 dark:bg-[#171816] dark:focus-within:border-[#ef7569]">
                <Search
                  className="h-5 w-5 shrink-0 text-[#74766f] dark:text-[#92948d]"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="sr-only">{copy.searchLabel}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-[#20211f] outline-none placeholder:text-[#74766f] dark:text-[#f1f1ed] dark:placeholder:text-[#92948d]"
                />
              </label>
            </div>
          </div>

          <div className="group relative min-h-[28rem] overflow-hidden lg:min-h-full">
            <Image
              src="/images/petcare-consultation.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#20211f]/10" />
          </div>
        </div>
      </section>

      <section className="px-4 pb-28 pt-8 sm:px-6 md:pb-40 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 border-y border-[#d1d2cc] py-5 dark:border-white/12">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal
                  className="h-4 w-4 text-[#b9473e] dark:text-[#ef7569]"
                  strokeWidth={1.8}
                />
                {copy.filters}
              </div>

              <div className="flex flex-1 flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <fieldset>
                  <legend className="sr-only">{copy.species}</legend>
                  <div className="flex flex-wrap gap-2">
                    {SPECIES.map((item) => {
                      const active = species === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSpecies(item.id)}
                          className={`min-h-10 whitespace-nowrap rounded-lg border px-3.5 text-sm font-semibold transition active:translate-y-px ${
                            active
                              ? "border-[#20211f] bg-[#20211f] text-[#f5f5ef] dark:border-[#ef7569] dark:bg-[#ef7569] dark:text-[#1a1b19]"
                              : "border-[#c4c5be] text-[#5d5f59] hover:border-[#b9473e] hover:text-[#b9473e] dark:border-white/15 dark:text-[#c6c7c0] dark:hover:border-[#ef7569] dark:hover:text-[#ef7569]"
                          }`}
                        >
                          {item.label[locale]}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <label className="relative">
                    <span className="sr-only">{copy.status}</span>
                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as ClinicStatus | "all")
                      }
                      className="min-h-10 w-full appearance-none rounded-lg border border-[#c4c5be] bg-transparent py-2 pl-3 pr-9 text-sm font-semibold text-[#4b4d48] outline-none transition focus:border-[#b9473e] focus:ring-4 focus:ring-[#d85f53]/15 dark:border-white/15 dark:text-[#d6d7d0]"
                    >
                      <option value="all">{copy.allStatuses}</option>
                      {Object.entries(STATUS).map(([key, labels]) => (
                        <option key={key} value={key}>
                          {labels[locale]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      strokeWidth={1.8}
                    />
                  </label>

                  <label className="relative">
                    <span className="sr-only">{copy.sort}</span>
                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as "distance" | "rating")
                      }
                      className="min-h-10 w-full appearance-none rounded-lg border border-[#c4c5be] bg-transparent py-2 pl-3 pr-9 text-sm font-semibold text-[#4b4d48] outline-none transition focus:border-[#b9473e] focus:ring-4 focus:ring-[#d85f53]/15 dark:border-white/15 dark:text-[#d6d7d0]"
                    >
                      <option value="distance">{copy.sortDistance}</option>
                      <option value="rating">{copy.sortRating}</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      strokeWidth={1.8}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="mb-6 text-sm text-[#676964] dark:text-[#b7b8b2]">
                <span className="text-2xl font-semibold tracking-[-0.03em] text-[#20211f] dark:text-[#f1f1ed]">
                  {filteredClinics.length}
                </span>{" "}
                {copy.result}
              </p>

              {filteredClinics.length > 0 ? (
                <div className="border-t border-[#c4c5be] dark:border-white/15">
                  {filteredClinics.map((clinic) => {
                    const selected = clinic.id === selectedClinic.id;

                    return (
                      <article
                        key={clinic.id}
                        data-clinic-row
                        className="group border-b border-[#c4c5be] py-7 dark:border-white/15"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(clinic.id)}
                          className="grid w-full gap-6 text-left sm:grid-cols-[11rem_1fr]"
                          aria-label={`${copy.selected}: ${clinic.name}`}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#deded8] dark:bg-[#292a28]">
                            <Image
                              data-clinic-image
                              src={clinic.image}
                              alt=""
                              fill
                              sizes="(min-width: 640px) 176px, 100vw"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                                  <span
                                    className={
                                      clinic.status === "closed"
                                        ? "text-[#74766f] dark:text-[#92948d]"
                                        : "text-[#47735e] dark:text-[#8fc3aa]"
                                    }
                                  >
                                    {STATUS[clinic.status][locale]}
                                  </span>
                                  {clinic.is24h && (
                                    <span className="inline-flex items-center gap-1.5 text-[#b9473e] dark:text-[#ef7569]">
                                      <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                                      {copy.openAllDay}
                                    </span>
                                  )}
                                </div>
                                <h2 className="text-xl font-semibold leading-tight tracking-[-0.025em] text-[#20211f] transition-colors group-hover:text-[#b9473e] dark:text-[#f1f1ed] dark:group-hover:text-[#ef7569] sm:text-2xl">
                                  {clinic.name}
                                </h2>
                              </div>

                              {selected && (
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#d85f53] text-[#1a1b19]">
                                  <Check className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                                </span>
                              )}
                            </div>

                            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
                              <MapPin
                                className="mt-0.5 h-4 w-4 shrink-0 text-[#b9473e] dark:text-[#ef7569]"
                                strokeWidth={1.8}
                              />
                              {clinic.address}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                              <span className="inline-flex items-center gap-1.5 font-semibold">
                                <Star
                                  className="h-4 w-4 fill-[#d85f53] text-[#d85f53]"
                                  strokeWidth={1.8}
                                />
                                {clinic.rating}
                                <span className="font-normal text-[#74766f] dark:text-[#92948d]">
                                  ({formatReviews(clinic.reviews, locale)} {copy.reviews})
                                </span>
                              </span>
                              <span className="font-semibold text-[#b9473e] dark:text-[#ef7569]">
                                {clinic.distance.toLocaleString(
                                  locale === "vi" ? "vi-VN" : "en-US",
                                )}{" "}
                                km
                              </span>
                              {clinic.isVerified && (
                                <span className="inline-flex items-center gap-1.5 text-[#5d5f59] dark:text-[#c6c7c0]">
                                  <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                                  {copy.verified}
                                </span>
                              )}
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-[#5d5f59] dark:text-[#c6c7c0]">
                              {clinic.services[locale].join(" / ")}
                            </p>
                          </div>
                        </button>

                        <div className="mt-5 flex items-center justify-end gap-3 sm:pl-[12.5rem]">
                          <a
                            href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#b4b6af] px-4 text-sm font-bold text-[#393a37] transition hover:border-[#b9473e] hover:text-[#b9473e] active:translate-y-px dark:border-white/20 dark:text-[#d6d7d0] dark:hover:border-[#ef7569] dark:hover:text-[#ef7569]"
                          >
                            <Phone className="h-4 w-4" strokeWidth={1.8} />
                            {copy.call}
                          </a>
                          <Link
                            href={`/clinics/${clinic.id}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#20211f] px-4 text-sm font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#353633] active:translate-y-px dark:bg-[#d85f53] dark:text-[#1a1b19] dark:hover:bg-[#ef7569]"
                          >
                            {copy.details}
                            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-[#c4c5be] px-6 py-16 text-center dark:border-white/15">
                  <Search
                    className="mx-auto h-8 w-8 text-[#b9473e] dark:text-[#ef7569]"
                    strokeWidth={1.6}
                  />
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                    {copy.emptyTitle}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
                    {copy.emptyBody}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 min-h-11 whitespace-nowrap rounded-lg bg-[#20211f] px-5 text-sm font-bold text-[#f5f5ef] transition hover:bg-[#353633] active:translate-y-px dark:bg-[#d85f53] dark:text-[#1a1b19] dark:hover:bg-[#ef7569]"
                  >
                    {copy.clear}
                  </button>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:col-span-5">
              <div className="overflow-hidden rounded-2xl bg-[#242523] text-[#f1f1ed]">
                <div className="relative min-h-[23rem] overflow-hidden">
                  <Image
                    key={selectedClinic.id}
                    src={selectedClinic.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="object-cover opacity-55 transition-transform duration-700 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#20211f]/45" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#ef7569]">
                      <MapPin className="h-4 w-4" strokeWidth={1.8} />
                      {copy.selected}
                    </div>
                    <h2 className="max-w-md text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#f1f1ed]">
                      {selectedClinic.name}
                    </h2>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#c9cac3]">
                      {selectedClinic.address}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d85f53] text-[#1a1b19]">
                      <MapPin className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#f1f1ed]">{copy.mapTitle}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#b7b8b2]">
                        {copy.mapDescription}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-[#b7b8b2]">
                    <span>{copy.mapPending}</span>
                    <Clock3 className="h-4 w-4 shrink-0 text-[#ef7569]" />
                  </div>

                  <Link
                    href={`/clinics/${selectedClinic.id}`}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#d85f53] px-5 text-sm font-bold text-[#1a1b19] transition hover:-translate-y-0.5 hover:bg-[#ef7569] active:translate-y-px"
                  >
                    {copy.details}
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
