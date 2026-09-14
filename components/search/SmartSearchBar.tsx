"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, X, Dog, Cat, Bird, Rabbit,
  Loader2, ChevronRight, Star, Navigation
} from "lucide-react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { Locale } from "@/i18n";
import { Species } from "@prisma/client";

interface SmartSearchBarProps {
  locale: Locale;
  compact?: boolean;
}

const SPECIES_PILLS = [
  { key: Species.DOG, icon: Dog, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: Species.CAT, icon: Cat, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { key: Species.BIRD, icon: Bird, color: "bg-sky-100 text-sky-700 border-sky-200" },
  { key: Species.RABBIT, icon: Rabbit, color: "bg-pink-100 text-pink-700 border-pink-200" },
] as const;

const QUICK_SEARCHES = [
  "phòng khám mèo Cầu Giấy",
  "bác sĩ vẹt 24/7 Hà Nội",
  "thú y chó Đống Đa",
  "exotic pet specialist",
];

export function SmartSearchBar({ locale, compact = false }: SmartSearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [useGeo, setUseGeo] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Typeahead suggestions
  const { data: suggestions, isLoading: suggestionsLoading } =
    api.search.suggestions.useQuery(
      { query: debouncedQuery },
      {
        enabled: debouncedQuery.length >= 2 && isFocused,
        staleTime: 5000,
      }
    );

  const handleGeoToggle = useCallback(() => {
    if (useGeo) {
      setUseGeo(false);
      setCoords(null);
      return;
    }

    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseGeo(true);
        setIsGeoLoading(false);
      },
      () => {
        setIsGeoLoading(false);
        alert(t("geoError" as keyof ReturnType<typeof t>));
      },
      { timeout: 8000 }
    );
  }, [useGeo, t]);

  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const q = searchQuery ?? query;
      if (!q.trim() && !selectedSpecies) return;

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (selectedSpecies) params.set("species", selectedSpecies);
      if (coords) {
        params.set("lat", coords.lat.toString());
        params.set("lng", coords.lng.toString());
      }

      router.push(`/clinics?${params.toString()}`);
      setIsFocused(false);
    },
    [query, selectedSpecies, coords, locale, router]
  );

  const showDropdown = isFocused && (query.length >= 2 || (!query && !compact));

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-full" : "w-full max-w-2xl"}`}>
      {/* ── Main Input Container ─────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 bg-white border-2 rounded-2xl transition-all duration-200 shadow-card ${
          isFocused
            ? "border-primary-400 shadow-medical"
            : "border-slate-200 hover:border-primary-300"
        } ${compact ? "px-3 py-2" : "px-4 py-3"}`}
      >
        {/* Search icon */}
        <Search className={`flex-shrink-0 text-slate-400 ${compact ? "w-4 h-4" : "w-5 h-5"}`} />

        {/* Species Pills (non-compact) */}
        {!compact && selectedSpecies && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {SPECIES_PILLS.filter((s) => s.key === selectedSpecies).map(({ key, icon: Icon, color }) => (
              <span key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${color}`}>
                <Icon className="w-3 h-3" />
                {t(key.toLowerCase() as "dog" | "cat" | "bird" | "rabbit")}
                <button onClick={() => setSelectedSpecies(null)} className="ml-0.5 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={compact ? t("placeholder").slice(0, 40) + "..." : t("placeholder")}
          className={`flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 ${
            compact ? "text-sm" : "text-base"
          }`}
          aria-label="Search clinics"
          id="smart-search-input"
          autoComplete="off"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Geo toggle */}
        <button
          onClick={handleGeoToggle}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
            useGeo
              ? "bg-primary-100 text-primary-600"
              : "text-slate-400 hover:text-primary-500 hover:bg-primary-50"
          }`}
          title={t("useLocation")}
          aria-label="Use my location"
        >
          {isGeoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </button>

        {/* Search button */}
        {!compact && (
          <button
            onClick={() => handleSearch()}
            className="flex-shrink-0 bg-gradient-medical text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-medical transition-all duration-200"
          >
            {t("search" as "search")}
          </button>
        )}
      </div>

      {/* ── Species Pills Row (non-compact) ─────────────────────────────── */}
      {!compact && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">Loài:</span>
          <button
            onClick={() => setSelectedSpecies(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              !selectedSpecies
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
            }`}
          >
            {t("allSpecies")}
          </button>
          {SPECIES_PILLS.map(({ key, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setSelectedSpecies(selectedSpecies === key ? null : key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedSpecies === key
                  ? color + " shadow-sm scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              <Icon className="w-3 h-3" />
              {t(key.toLowerCase() as "dog" | "cat" | "bird" | "rabbit")}
            </button>
          ))}

          {/* Geo status indicator */}
          {useGeo && coords && (
            <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
              <MapPin className="w-3 h-3" />
              Vị trí của bạn
            </span>
          )}
        </div>
      )}

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-card-hover overflow-hidden z-50"
          >
            {/* Loading state */}
            {suggestionsLoading && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                <span className="text-sm text-slate-500">Đang tìm kiếm...</span>
              </div>
            )}

            {/* Typeahead results */}
            {suggestions && suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  Phòng khám
                </div>
                {suggestions.map((clinic) => (
                  <button
                    key={clinic.id}
                    onClick={() => router.push(`/clinics/${clinic.slug}`)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      {clinic.logoUrl ? (
                        <img src={clinic.logoUrl} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Search className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{clinic.name}</p>
                      <p className="text-xs text-slate-500 truncate">{clinic.city}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick searches when no query */}
            {!query && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  Tìm kiếm phổ biến
                </div>
                {QUICK_SEARCHES.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); handleSearch(q); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-primary-50 transition-colors text-left"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{q}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {query.length >= 2 && !suggestionsLoading && suggestions?.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-500">{t("noResults")}</p>
                <button
                  onClick={() => handleSearch()}
                  className="mt-2 text-sm text-primary-600 font-medium hover:underline"
                >
                  Tìm kiếm tất cả kết quả →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
