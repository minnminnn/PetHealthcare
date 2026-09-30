"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { api } from "@/trpc/react";
import { getCurrentLocation, getLocationErrorMessage } from "@/lib/geolocation";
import { useDebounce } from "@/lib/hooks/useDebounce";

gsap.registerPlugin(useGSAP);

type Locale = "vi" | "en";

const ClinicMap = dynamic(
  () => import("./ClinicMap").then((module) => module.ClinicMap),
  { ssr: false },
);

const COPY = {
  vi: {
    eyebrow: "Phòng khám quanh bạn",
    title: "Tìm nơi chăm sóc phù hợp, gần bạn.",
    description:
      "Chọn một khu vực để xem các phòng khám thú y thật sự được Mapbox tìm thấy gần đó.",
    searchLabel: "Tìm theo khu vực",
    searchPlaceholder: "Nhập thành phố, quận hoặc khu phố",
    locationHint: "Chọn một khu vực để tìm phòng khám gần đó",
    typeMore: "Nhập ít nhất 3 ký tự để bắt đầu tìm kiếm.",
    noPlaces: "Không tìm thấy khu vực phù hợp. Hãy thử tên gần đó.",
    useLocation: "Dùng vị trí hiện tại",
    clearSearch: "Xóa tìm kiếm",
    results: "phòng khám do Mapbox tìm thấy",
    searching: "Đang tìm phòng khám quanh khu vực này…",
    source: "Kết quả trực tiếp từ Mapbox",
    distance: "cách tâm tìm kiếm",
    showOnMap: "Xem trên bản đồ",
    emptyTitle: "Chưa tìm thấy phòng khám quanh khu vực này",
    emptyBody:
      "Thử chọn một khu vực khác hoặc mở rộng tìm kiếm bằng vị trí hiện tại.",
    mapTitle: "Bản đồ kết quả",
    mapDescription:
      "Số trên bản đồ khớp với số trong danh sách. Không còn lớp chấm đen từ dữ liệu mẫu.",
    searchCenter: "Tâm tìm kiếm",
    nearbyClinic: "Phòng khám gần đó",
    selectLocation: "Chọn một khu vực ở thanh tìm kiếm để bắt đầu.",
  },
  en: {
    eyebrow: "Care near you",
    title: "Find the right care, close to home.",
    description:
      "Choose an area to see real veterinary clinics returned by Mapbox nearby.",
    searchLabel: "Search by area",
    searchPlaceholder: "Enter a city, district, or neighborhood",
    locationHint: "Choose an area to find nearby clinics",
    typeMore: "Enter at least 3 characters to start searching.",
    noPlaces: "No matching areas found. Try a nearby place name.",
    useLocation: "Use current location",
    clearSearch: "Clear search",
    results: "clinics found by Mapbox",
    searching: "Finding clinics around this area…",
    source: "Live result from Mapbox",
    distance: "from the search center",
    showOnMap: "Show on map",
    emptyTitle: "No clinics found around this area",
    emptyBody: "Choose another area or try your current location.",
    mapTitle: "Result map",
    mapDescription:
      "Map numbers match the list. The old black demo-marker layer has been removed.",
    searchCenter: "Search center",
    nearbyClinic: "Nearby clinic",
    selectLocation: "Choose an area in the search field to begin.",
  },
} as const;

function formatDistance(meters: number | null, locale: Locale) {
  if (meters === null) return null;
  if (meters < 1000) {
    return `${Math.round(meters / 10) * 10} m`;
  }
  return `${new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 1,
  }).format(meters / 1000)} km`;
}

export function ClinicsExperience({ locale }: { locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const copy = COPY[locale];
  const initialLat = Number(searchParams.get("lat"));
  const initialLng = Number(searchParams.get("lng"));
  const hasInitialOrigin =
    searchParams.has("lat") &&
    Number.isFinite(initialLat) &&
    Number.isFinite(initialLng);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(() =>
    hasInitialOrigin ? (searchParams.get("q") ?? copy.searchCenter) : null,
  );
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    () => (hasInitialOrigin ? { lat: initialLat, lng: initialLng } : null),
  );
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [focusedResultId, setFocusedResultId] = useState<string>();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const clinicsQuery = api.clinics.discover.useQuery(
    { sort: "rating", limit: 30, radiusKm: 50 },
    { staleTime: 30_000 },
  );
  const databaseClinics = clinicsQuery.data ?? [];
  const selectedDatabaseClinic =
    databaseClinics.find((clinic) => clinic.id === selectedClinicId) ??
    databaseClinics[0];

  useEffect(() => {
    if (
      selectedDatabaseClinic &&
      selectedDatabaseClinic.id !== selectedClinicId
    ) {
      setSelectedClinicId(selectedDatabaseClinic.id);
    }
  }, [selectedClinicId, selectedDatabaseClinic]);

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

  const canSearchMap = Boolean(origin || selectedDatabaseClinic);
  const mapInput = origin
    ? { lat: origin.lat, lng: origin.lng, locale, radiusKm: 8 }
    : {
        clinicId: selectedDatabaseClinic?.id ?? "pending-clinic",
        locale,
        radiusKm: 8,
      };
  const mapDataQuery = api.clinics.mapData.useQuery(mapInput, {
    enabled: canSearchMap,
    retry: false,
    staleTime: 30_000,
  });
  const nearbyClinics = useMemo(
    () => mapDataQuery.data?.nearby ?? [],
    [mapDataQuery.data?.nearby],
  );

  useEffect(() => {
    setFocusedResultId(undefined);
  }, [origin?.lat, origin?.lng, selectedDatabaseClinic?.id]);

  useGSAP(
    () => {
      if (reduceMotion) return;
      gsap.fromTo(
        "[data-clinic-hero] > *",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" },
      );
    },
    { scope: root, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  const clearSearch = () => {
    setQuery("");
    setSelectedPlace(null);
    setOrigin(null);
    setLocationError("");
    setFocusedResultId(undefined);
  };

  const useCurrentLocation = async () => {
    if (isLocating) return;
    setLocationError("");
    setIsLocating(true);
    try {
      const nextOrigin = await getCurrentLocation();
      setOrigin(nextOrigin);
      setSelectedPlace(copy.useLocation);
      setQuery(copy.useLocation);
      setIsSearchFocused(false);
    } catch (error) {
      setLocationError(getLocationErrorMessage(error, locale));
    } finally {
      setIsLocating(false);
    }
  };

  const handleResultSelect = useCallback((id: string) => {
    setFocusedResultId(id);
  }, []);

  const showSuggestionPanel =
    isSearchFocused && !selectedPlace && query.trim().length > 0;

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
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.13em] text-[#676964] dark:text-[#b7b8b2]">
                {copy.searchLabel}
              </label>
              <div className="flex min-h-16 items-center rounded-2xl border border-[#b0b1aa] bg-[#f8f8f5] shadow-[0_10px_30px_rgba(32,33,31,.07)] transition focus-within:border-[#b9473e] focus-within:ring-4 focus-within:ring-[#d85f53]/15 dark:border-white/15 dark:bg-[#171816] dark:shadow-none dark:focus-within:border-[#ef7569]">
                <Search
                  className="ml-5 h-5 w-5 shrink-0 text-[#74766f] dark:text-[#92948d]"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedPlace(null);
                    setOrigin(null);
                    setLocationError("");
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    window.setTimeout(() => setIsSearchFocused(false), 150)
                  }
                  placeholder={copy.searchPlaceholder}
                  className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-4 text-base text-[#20211f] outline-none ring-0 placeholder:text-[#74766f] focus:outline-none focus:ring-0 dark:text-[#f1f1ed] dark:placeholder:text-[#92948d]"
                />
                {query && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={clearSearch}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#676964] transition hover:bg-[#e5e5df] hover:text-[#20211f] dark:text-[#b7b8b2] dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={copy.clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div className="mx-2 h-8 w-px bg-[#d1d2cc] dark:bg-white/10" />
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                  className="mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#b9473e] transition hover:bg-[#eee4e1] disabled:opacity-60 dark:text-[#ef7569] dark:hover:bg-[#ef7569]/10"
                  aria-label={copy.useLocation}
                  title={copy.useLocation}
                >
                  {isLocating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LocateFixed className="h-5 w-5" />
                  )}
                </button>
              </div>

              {locationError && (
                <p className="mt-2 text-xs font-medium text-[#b9473e] dark:text-[#ef7569]">
                  {locationError}
                </p>
              )}

              {showSuggestionPanel && (
                <div className="absolute inset-x-0 top-[calc(100%+.6rem)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-[#c4c5be] bg-[#f8f8f5] p-2 shadow-2xl dark:border-white/15 dark:bg-[#20211f]">
                  <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#74766f] dark:text-[#92948d]">
                    {copy.locationHint}
                  </p>
                  {query.trim().length < 3 ? (
                    <p className="px-3 pb-3 text-sm text-[#676964] dark:text-[#b7b8b2]">
                      {copy.typeMore}
                    </p>
                  ) : locationQuery.isFetching ? (
                    <div className="flex items-center gap-3 px-3 py-4 text-sm text-[#676964] dark:text-[#b7b8b2]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#b9473e] dark:text-[#ef7569]" />
                      {copy.searching}
                    </div>
                  ) : (locationQuery.data?.length ?? 0) > 0 ? (
                    locationQuery.data?.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOrigin({
                            lat: place.latitude,
                            lng: place.longitude,
                          });
                          setSelectedPlace(place.address);
                          setQuery(place.address);
                          setIsSearchFocused(false);
                        }}
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#ecece7] dark:hover:bg-white/[0.06]"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b9473e] dark:text-[#ef7569]" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {place.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-[#676964] dark:text-[#b7b8b2]">
                            {place.address}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 pb-3 text-sm text-[#676964] dark:text-[#b7b8b2]">
                      {copy.noPlaces}
                    </p>
                  )}
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
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#c4c5be] pb-5 dark:border-white/15">
                <p className="text-sm text-[#676964] dark:text-[#b7b8b2]">
                  <span className="mr-2 text-3xl font-semibold tracking-[-0.04em] text-[#20211f] dark:text-[#f1f1ed]">
                    {nearbyClinics.length}
                  </span>
                  {copy.results}
                </p>
                <span className="hidden text-xs font-semibold text-[#74766f] dark:text-[#92948d] sm:block">
                  {copy.source}
                </span>
              </div>

              {mapDataQuery.isFetching || clinicsQuery.isLoading ? (
                <div className="space-y-3" aria-label={copy.searching}>
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-32 animate-pulse rounded-2xl bg-[#e3e3de] dark:bg-[#242523]"
                    />
                  ))}
                </div>
              ) : nearbyClinics.length > 0 ? (
                <div className="space-y-3">
                  {nearbyClinics.map((clinic, index) => {
                    const focused = clinic.id === focusedResultId;
                    const distance = formatDistance(
                      clinic.distanceMeters,
                      locale,
                    );
                    return (
                      <article
                        key={clinic.id}
                        className={`rounded-2xl border p-5 transition sm:p-6 ${
                          focused
                            ? "border-[#d85f53] bg-[#eee4e1] shadow-[0_14px_35px_rgba(32,33,31,.08)] dark:bg-[#2b2220]"
                            : "border-[#c4c5be] bg-[#f8f8f5] hover:border-[#a6a8a0] dark:border-white/12 dark:bg-[#20211f] dark:hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d85f53] text-sm font-bold text-[#191a18] ring-4 ring-[#d85f53]/15">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#b9473e] dark:text-[#ef7569]">
                              {copy.source}
                            </p>
                            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.025em] sm:text-2xl">
                              {clinic.name}
                            </h2>
                            <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#676964] dark:text-[#b7b8b2]">
                              <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#b9473e] dark:text-[#ef7569]" />
                              {clinic.address}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5d5f59] dark:text-[#c6c7c0]">
                              {distance && (
                                <span className="rounded-full bg-[#e5e5df] px-3 py-1.5 dark:bg-white/[0.07]">
                                  {distance} {copy.distance}
                                </span>
                              )}
                              {clinic.categories.slice(0, 2).map((category) => (
                                <span
                                  key={category}
                                  className="rounded-full border border-[#d1d2cc] px-3 py-1.5 dark:border-white/10"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResultSelect(clinic.id)}
                          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#20211f] px-4 text-sm font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#353633] active:translate-y-px dark:bg-[#d85f53] dark:text-[#1a1b19] dark:hover:bg-[#ef7569] sm:ml-[3.25rem] sm:w-auto"
                        >
                          {copy.showOnMap}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#c4c5be] bg-[#f8f8f5] px-6 py-16 text-center dark:border-white/15 dark:bg-[#20211f]">
                  <Search className="mx-auto h-8 w-8 text-[#b9473e] dark:text-[#ef7569]" />
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                    {canSearchMap ? copy.emptyTitle : copy.selectLocation}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
                    {copy.emptyBody}
                  </p>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:col-span-5">
              <div className="overflow-hidden rounded-2xl bg-[#242523] text-[#f1f1ed]">
                <div className="relative min-h-[28rem] overflow-hidden">
                  <ClinicMap
                    center={mapDataQuery.data?.center ?? null}
                    centerLabel={selectedPlace ?? copy.searchCenter}
                    selectedClinic={mapDataQuery.data?.selected ?? null}
                    nearbyClinics={nearbyClinics}
                    focusedResultId={focusedResultId}
                    locale={locale}
                    isSearching={mapDataQuery.isFetching}
                    searchFailed={Boolean(
                      mapDataQuery.error || mapDataQuery.data?.warning,
                    )}
                    onNearbySelect={handleResultSelect}
                  />
                </div>

                <div className="border-t border-white/10 p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d85f53] text-[#1a1b19]">
                      <Navigation className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#f1f1ed]">
                        {copy.mapTitle}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#b7b8b2]">
                        {copy.mapDescription}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-semibold text-[#d6d7d0]">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d85f53] font-bold text-[#191a18]">
                        ⌖
                      </span>
                      {copy.searchCenter}
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d85f53] text-[10px] font-bold text-[#191a18]">
                        1
                      </span>
                      {copy.nearbyClinic}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
