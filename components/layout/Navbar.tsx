"use client";

import { useState, useEffect, useRef } from "react";
/**
 * ✅ CORRECT: Import Link, useRouter, usePathname from lib/navigation
 *    (next-intl locale-aware versions) — NOT from "next/link" or
 *    "next/navigation". This ensures every href is automatically prefixed
 *    with the active locale, keeping routes inside app/[locale]/layout.tsx.
 *
 * ❌ WRONG:  import Link from "next/link"          → generates /clinics
 * ✅ RIGHT:  import { Link } from "@/lib/navigation" → generates /vi/clinics
 */
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Globe, ChevronDown, User, Settings,
  LogOut, PawPrint, MapPin, Stethoscope,
  FlaskConical, Video, Droplets, LayoutDashboard,
  Bell, Search, Heart,
} from "lucide-react";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import type { Locale } from "@/i18n";

interface NavbarProps {
  locale: Locale;
}

/**
 * Nav link definitions — hrefs are locale-AGNOSTIC here.
 * The next-intl <Link> component prepends the active locale automatically.
 * e.g. href="/clinics" → rendered as <a href="/vi/clinics">
 */
const NAV_LINKS = [
  { href: "/clinics",     labelKey: "clinics",    icon: MapPin },
  { href: "/emergency",   labelKey: "emergency",  icon: Stethoscope },
  { href: "/pharmacy",    labelKey: "pharmacy",   icon: FlaskConical },
  { href: "/tele-vet",    labelKey: "teleVet",    icon: Video },
  { href: "/blood-donor", labelKey: "bloodDonor", icon: Droplets },
] as const;

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const { data: session } = useSession();

  // usePathname from next-intl returns path WITHOUT locale prefix
  // e.g. for /vi/clinics it returns /clinics
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled]     = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen]     = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef    = useRef<HTMLDivElement>(null);

  // ── Scroll detection (glassmorphism effect) ────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setIsLangOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Active link detection — compare against the locale-stripped pathname
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")
      ? "text-primary-600 font-semibold bg-primary-50"
      : "text-slate-600 hover:text-primary-600 hover:bg-slate-50";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-card border-b border-slate-200/60"
            : "bg-white/70 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── Brand Logo ──────────────────────────────────────────────── */}
            {/*
              Link href="/" → next-intl renders as /vi/ (locale-prefixed).
              This keeps the user inside app/[locale]/layout.tsx at all times.
            */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-medical flex items-center justify-center shadow-medical group-hover:scale-105 transition-transform">
                <PawPrint className="w-5 h-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-secondary-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">
                  PetCare
                </span>
                <div className="text-[10px] text-slate-500 font-medium -mt-1 tracking-wide">
                  VIETNAM
                </div>
              </div>
            </Link>

            {/* ── Desktop Nav Links ────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
                /*
                 * next-intl Link automatically prepends the locale.
                 * href="/clinics" → <a href="/vi/clinics"> in locale "vi".
                 * No manual `/${locale}${href}` concatenation needed.
                 */
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(href)}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(labelKey)}
                </Link>
              ))}
            </div>

            {/* ── Smart Search Bar (desktop) ──────────────────────────────── */}
            <div className="hidden md:flex flex-1 max-w-sm xl:max-w-md">
              <SmartSearchBar locale={locale} compact />
            </div>

            {/* ── Right Controls ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2">

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* ── Language Switcher ──────────────────────────────────────── */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="uppercase text-xs font-bold">{locale}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden z-50"
                    >
                      {[
                        { code: "vi" as Locale, label: "🇻🇳 Tiếng Việt" },
                        { code: "en" as Locale, label: "🇬🇧 English" },
                      ].map((lang) => (
                        /*
                         * Language switcher: use next/link with an explicit
                         * full path because we need to switch the locale segment
                         * itself, not just prepend the current one.
                         * Pattern: /[targetLocale][currentPathname]
                         */
                        <a
                          key={lang.code}
                          href={`/${lang.code}${pathname}`}
                          onClick={() => setIsLangOpen(false)}
                          className={`flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-primary-50 ${
                            locale === lang.code
                              ? "font-semibold text-primary-600 bg-primary-50"
                              : "text-slate-700"
                          }`}
                        >
                          {lang.label}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Auth Controls ─────────────────────────────────────────── */}
              {session?.user ? (
                <div className="flex items-center gap-2">
                  {/* Notifications Bell */}
                  <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emergency rounded-full" />
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen((v) => !v)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-medical flex items-center justify-center overflow-hidden">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name ?? ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-24 truncate">
                        {session.user.name?.split(" ").pop()}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-500 transition-transform ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {session.user.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {session.user.email}
                            </p>
                          </div>

                          {/* Profile links — locale-aware via next-intl Link */}
                          {[
                            { href: "/dashboard/owner" as const, icon: LayoutDashboard, label: t("dashboard") },
                            { href: "/dashboard/owner/pets" as const, icon: Heart, label: t("myPets") },
                            { href: "/settings" as const, icon: Settings, label: t("settings") },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}

                          <div className="border-t border-slate-100 mt-1">
                            <button
                              onClick={() =>
                                signOut({ callbackUrl: `/${locale}` })
                              }
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              {t("logout")}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold bg-gradient-medical text-white rounded-lg shadow-medical hover:shadow-medical-lg hover:scale-105 transition-all duration-200"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen((v) => !v)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Menu"
              >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Search ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden pb-3 overflow-hidden"
              >
                <SmartSearchBar locale={locale} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile Nav Menu ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
                {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(href)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(labelKey)}
                  </Link>
                ))}

                {/* Mobile Auth */}
                {!session?.user && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-primary-700 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-gradient-medical text-white rounded-xl"
                    >
                      {t("register")}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
