"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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
  Loader2,
  Navigation,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ClinicStatus as PrismaClinicStatus, Species as PrismaSpecies } from "@prisma/client";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Locale = "vi" | "en";
type Species = "all" | "dog" | "cat" | "bird" | "reptile" | "exotic";
type ClinicStatus = "available" | "emergency" | "busy" | "closed";

const ClinicMap = dynamic(
  () => import("./ClinicMap").then((module) => module.ClinicMap),
  { ssr: false },
);

const SPECIES_VALUE: Partial<Record<Species, PrismaSpecies>> = {
  dog: PrismaSpecies.DOG,
  cat: PrismaSpecies.CAT,
  bird: PrismaSpecies.BIRD,
  reptile: PrismaSpecies.REPTILE,
  exotic: PrismaSpecies.OTHER,
};

const STATUS_VALUE: Record<ClinicStatus, PrismaClinicStatus> = {
  available: PrismaClinicStatus.AVAILABLE,
  emergency: PrismaClinicStatus.EMERGENCY,
  busy: PrismaClinicStatus.BUSY,
  closed: PrismaClinicStatus.CLOSED,
};

const UI_STATUS: Record<PrismaClinicStatus, ClinicStatus> = {
  AVAILABLE: "available",
  EMERGENCY: "emergency",
  BUSY: "busy",
  CLOSED: "closed",
};

const COPY = {
  vi: {
    breadcrumbHome: "Trang chủ",
    breadcrumbCurrent: "Phòng khám",
    eyebrow: "Phòng khám quanh bạn",
    title: "Tìm nơi chăm sóc phù hợp, gần bạn.",
    description: "So sánh chuyên môn, giờ mở cửa và đánh giá trước khi đặt lịch.",
    searchPlaceholder: "Tên phòng khám, khu vực hoặc dịch vụ",
    searchLabel: "Tìm kiếm phòng khám",
    locationHint: "Chọn một địa điểm để tìm phòng khám gần đó",
    useLocation: "Dùng vị trí hiện tại",
    locationError: "Không thể truy cập vị trí của bạn.",
    loading: "Đang tìm phòng khám đã xác minh…",
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
    mapPending: "Chỉ các phòng khám có tọa độ đã xác minh mới xuất hiện trên bản đồ.",
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
    locationHint: "Choose a place to find clinics nearby",
    useLocation: "Use current location",
    locationError: "We could not access your location.",
    loading: "Finding verified clinics…",
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
    mapPending: "Only clinics with verified coordinates appear on the map.",
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
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const copy = COPY[locale];
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [species, setSpecies] = useState<Species>(() => {
    const value = searchParams.get("species")?.toLocaleLowerCase();
    return value && ["dog", "cat", "bird", "reptile", "exotic"].includes(value)
      ? (value as Species)
      : "all";
  });
  const [status, setStatus] = useState<ClinicStatus | "all">("all");
  const [sort, setSort] = useState<"distance" | "rating">("distance");
  const [selectedId, setSelectedId] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    return Number.isFinite(lat) && Number.isFinite(lng) && searchParams.has("lat")
      ? { lat, lng }
      : null;
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const discoveryInput = useMemo(
    () => ({
      query: selectedPlace ? undefined : debouncedQuery.trim() || undefined,
      species: species === "all" ? undefined : SPECIES_VALUE[species],
      status: status === "all" ? undefined : STATUS_VALUE[status],
      sort,
      lat: origin?.lat,
      lng: origin?.lng,
      radiusKm: 50,
      limit: 30,
    }),
    [debouncedQuery, origin, selectedPlace, sort, species, status],
  );

  const clinicsQuery = api.clinics.discover.useQuery(discoveryInput, {
    staleTime: 30_000,
  });
  const locationQuery = api.clinics.locationSuggestions.useQuery(
    {
      query: debouncedQuery,
      locale,
      lat: origin?.lat,
      lng: origin?.lng,
      limit: 5,
    },
    {
      enabled:
        isSearchFocused && !selectedPlace && debouncedQuery.trim().length >= 3,
      staleTime: 30_000,
      retry: false,
    },
  );

  const filteredClinics = clinicsQuery.data ?? [];
  const selectedClinic =
    filteredClinics.find((clinic) => clinic.id === selectedId) ??
    filteredClinics[0];

  useEffect(() => {
    if (selectedClinic && selectedClinic.id !== selectedId) {
      setSelectedId(selectedClinic.id);
    }
  }, [selectedClinic, selectedId]);

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

  const clearFilters = () => {
    setQuery("");
    setSelectedPlace(null);
    setOrigin(null);
    setSpecies("all");
    setStatus("all");
    setSort("distance");
  };

  const useCurrentLocation = () => {
    setLocationError("");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude });
        setSelectedPlace(copy.useLocation);
        setQuery(copy.useLocation);
        setSort("distance");
        setIsLocating(false);
      },
      () => {
        setLocationError(copy.locationError);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 },
    );
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
            {/* <nav
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
            </nav> */}

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

            <div className="relative">
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
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedPlace(null);
                    setOrigin(null);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 150)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-[#20211f] outline-none placeholder:text-[#74766f] dark:text-[#f1f1ed] dark:placeholder:text-[#92948d]"
                />
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#676964] transition hover:bg-[#deded8] hover:text-[#b9473e] disabled:opacity-60 dark:text-[#b7b8b2] dark:hover:bg-white/10 dark:hover:text-[#ef7569]"
                  aria-label={copy.useLocation}
                  title={copy.useLocation}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </button>
              </label>
              {locationError && (
                <p className="mt-2 text-xs font-medium text-[#b9473e] dark:text-[#ef7569]">
                  {locationError}
                </p>
              )}
              {isSearchFocused && (locationQuery.data?.length ?? 0) > 0 && (
                <div className="absolute inset-x-0 top-[calc(100%+.5rem)] z-30 overflow-hidden rounded-xl border border-[#c4c5be] bg-[#f8f8f5] shadow-xl dark:border-white/15 dark:bg-[#20211f]">
                  <p className="border-b border-[#d1d2cc] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#74766f] dark:border-white/10 dark:text-[#92948d]">
                    {copy.locationHint}
                  </p>
                  {locationQuery.data?.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setOrigin({ lat: place.latitude, lng: place.longitude });
                        setSelectedPlace(place.address);
                        setQuery(place.address);
                        setSort("distance");
                        setIsSearchFocused(false);
                      }}
                      className="flex w-full items-start gap-3 border-b border-[#d1d2cc] px-4 py-3 text-left last:border-0 hover:bg-[#ecece7] dark:border-white/10 dark:hover:bg-white/[0.06]"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b9473e] dark:text-[#ef7569]" />
                      <span>
                        <span className="block text-sm font-semibold">{place.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[#676964] dark:text-[#b7b8b2]">
                          {place.address}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
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

              {clinicsQuery.isLoading ? (
                <div className="flex min-h-64 items-center justify-center gap-3 border-y border-[#c4c5be] text-sm text-[#676964] dark:border-white/15 dark:text-[#b7b8b2]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#b9473e] dark:text-[#ef7569]" />
                  {copy.loading}
                </div>
              ) : filteredClinics.length > 0 ? (
                <div className="border-t border-[#c4c5be] dark:border-white/15">
                  {filteredClinics.map((clinic) => {
                    const selected = clinic.id === selectedClinic?.id;
                    const clinicStatus = UI_STATUS[clinic.status];
                    const clinicImage =
                      clinic.coverImageUrl ??
                      clinic.logoUrl ??
                      "/images/petcare-consultation.webp";

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
                              src={clinicImage}
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
                                      clinicStatus === "closed"
                                        ? "text-[#74766f] dark:text-[#92948d]"
                                        : "text-[#47735e] dark:text-[#8fc3aa]"
                                    }
                                  >
                                    {STATUS[clinicStatus][locale]}
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
                                  ({formatReviews(clinic.reviewCount, locale)} {copy.reviews})
                                </span>
                              </span>
                              {clinic.distanceKm !== null && (
                                <span className="font-semibold text-[#b9473e] dark:text-[#ef7569]">
                                  {clinic.distanceKm.toLocaleString(
                                    locale === "vi" ? "vi-VN" : "en-US",
                                  )}{" "}
                                  km
                                </span>
                              )}
                              {clinic.isVerified && (
                                <span className="inline-flex items-center gap-1.5 text-[#5d5f59] dark:text-[#c6c7c0]">
                                  <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                                  {copy.verified}
                                </span>
                              )}
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-[#5d5f59] dark:text-[#c6c7c0]">
                              {clinic.specializations
                                .map((item) => item.replaceAll("_", " ").toLocaleLowerCase(locale))
                                .join(" / ")}
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
                          <a
                            href={clinic.website ?? `tel:${clinic.phone.replace(/[^+\d]/g, "")}`}
                            target={clinic.website ? "_blank" : undefined}
                            rel={clinic.website ? "noreferrer" : undefined}
                            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#20211f] px-4 text-sm font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#353633] active:translate-y-px dark:bg-[#d85f53] dark:text-[#1a1b19] dark:hover:bg-[#ef7569]"
                          >
                            {copy.details}
                            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                          </a>
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
                  <ClinicMap
                    clinics={filteredClinics}
                    selectedId={selectedClinic?.id}
                    onSelect={setSelectedId}
                  />
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

                  {selectedClinic && (
                    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-base font-semibold text-[#f1f1ed]">
                        {selectedClinic.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#b7b8b2]">
                        {selectedClinic.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
