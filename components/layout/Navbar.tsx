"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Bell,
  ChevronDown,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import type { Locale } from "@/i18n";

interface NavbarProps {
  locale: Locale;
}

const NAV_LINKS = [
  { href: "/clinics", labelKey: "clinics" },
  { href: "/emergency", labelKey: "emergency" },
  { href: "/pharmacy", labelKey: "pharmacy" },
  { href: "/tele-vet", labelKey: "teleVet" },
  { href: "/blood-donor", labelKey: "bloodDonor" },
] as const;

const menuMotion = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
};

export function Navbar({ locale }: NavbarProps) {
  
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const motionProps = reduceMotion ? {} : menuMotion;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const exceptNavbar = ["/login", "/register"];

  const isExceptNavbar = exceptNavbar.includes(pathname);

  if (isExceptNavbar) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      aria-label="Primary navigation"
    >
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/35 bg-[#f3f3f0]/88 px-3 shadow-[0_12px_40px_rgba(32,33,31,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#20211f]/88 dark:shadow-[0_12px_40px_rgba(0,0,0,.28)]">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex flex-shrink-0 items-center gap-2.5"
            aria-label="PetCare home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d85f53] text-[#1a1b19] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <PawPrint className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-[-0.03em] text-[#20211f] dark:text-[#f1f1ed]">
              PetCare
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                  isActive(href)
                    ? "bg-[#deded8] text-[#20211f] dark:bg-white/10 dark:text-[#f1f1ed]"
                    : "text-[#5d5f59] hover:text-[#b9473e] dark:text-[#c6c7c0] dark:hover:text-[#ef7569]"
                }`}
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              className="grid h-9 w-9 place-items-center rounded-lg text-[#4b4d48] transition hover:bg-[#deded8] hover:text-[#b9473e] dark:text-[#d6d7d0] dark:hover:bg-white/10 dark:hover:text-[#ef7569]"
              aria-label={t("home") === "Home" ? "Search" : "Tìm kiếm"}
              aria-expanded={isSearchOpen}
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen((current) => !current)}
                className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold uppercase text-[#4b4d48] transition hover:bg-[#deded8] dark:text-[#d6d7d0] dark:hover:bg-white/10"
                aria-label={`${t("language")}: ${locale.toUpperCase()}`}
                aria-expanded={isLangOpen}
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                {locale}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    {...motionProps}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-[#d1d2cc] bg-[#f3f3f0] p-1 shadow-[0_16px_44px_rgba(32,33,31,.18)] dark:border-white/10 dark:bg-[#242523]"
                  >
                    {[
                      { code: "vi" as Locale, label: "Tiếng Việt" },
                      { code: "en" as Locale, label: "English" },
                    ].map((language) => (
                      <a
                        key={language.code}
                        href={`/${language.code}${pathname}`}
                        onClick={() => setIsLangOpen(false)}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          locale === language.code
                            ? "bg-[#deded8] text-[#20211f] dark:bg-white/10 dark:text-[#f1f1ed]"
                            : "text-[#5d5f59] hover:text-[#b9473e] dark:text-[#c6c7c0] dark:hover:text-[#ef7569]"
                        }`}
                      >
                        {language.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {session?.user ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="hidden h-9 w-9 place-items-center rounded-lg text-[#4b4d48] transition hover:bg-[#deded8] sm:grid dark:text-[#d6d7d0] dark:hover:bg-white/10"
                  aria-label="Notifications"
                >
                  <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>

                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((current) => !current)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-[#d1d2cc] px-2 transition hover:border-[#b9473e] dark:border-white/15 dark:hover:border-[#ef7569]"
                    aria-expanded={isProfileOpen}
                  >
                    <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-lg bg-[#d85f53] text-[#1a1b19]">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="hidden max-w-24 truncate text-sm font-bold text-[#30312e] sm:block dark:text-[#f1f1ed]">
                      {session.user.name?.split(" ").pop()}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-[#676964] transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        {...motionProps}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-[#d1d2cc] bg-[#f3f3f0] p-1 shadow-[0_16px_44px_rgba(32,33,31,.18)] dark:border-white/10 dark:bg-[#242523]"
                      >
                        <div className="px-3 py-2.5">
                          <p className="truncate text-sm font-bold text-[#20211f] dark:text-[#f1f1ed]">
                            {session.user.name}
                          </p>
                          <p className="truncate text-xs text-[#676964] dark:text-[#aeb0aa]">
                            {session.user.email}
                          </p>
                        </div>
                        {[
                          {
                            href: "/dashboard/owner" as const,
                            icon: LayoutDashboard,
                            label: t("dashboard"),
                          },
                          {
                            href: "/dashboard/owner/pets" as const,
                            icon: Heart,
                            label: t("myPets"),
                          },
                          {
                            href: "/settings" as const,
                            icon: Settings,
                            label: t("settings"),
                          },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#4b4d48] transition hover:bg-[#deded8] hover:text-[#b9473e] dark:text-[#c6c7c0] dark:hover:bg-white/10 dark:hover:text-[#ef7569]"
                          >
                            <item.icon className="h-4 w-4" aria-hidden="true" />
                            {item.label}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={() => signOut({ callbackUrl: `/${locale}` })}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#b9473e] transition hover:bg-[#ffe4df] dark:text-[#ef7569] dark:hover:bg-white/10"
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          {t("logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Link
                  href="/login"
                  className="whitespace-nowrap px-3 py-2 text-sm font-bold text-[#4b4d48] transition hover:text-[#b9473e] dark:text-[#d6d7d0] dark:hover:text-[#ef7569]"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-lg bg-[#20211f] px-4 py-2 text-sm font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#353633] active:translate-y-px dark:bg-[#d85f53] dark:text-[#1a1b19] dark:hover:bg-[#ef7569]"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsMobileOpen((current) => !current)}
              className="grid h-9 w-9 place-items-center rounded-lg text-[#4b4d48] transition hover:bg-[#deded8] xl:hidden dark:text-[#d6d7d0] dark:hover:bg-white/10"
              aria-label="Menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              {...motionProps}
              transition={{ duration: 0.18 }}
              className="border-t border-[#d1d2cc] py-3 dark:border-white/10"
            >
              <SmartSearchBar locale={locale} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              {...motionProps}
              transition={{ duration: 0.18 }}
              className="border-t border-[#d1d2cc] py-2 xl:hidden dark:border-white/10"
            >
              {NAV_LINKS.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-sm font-bold transition-colors ${isActive(href) ? "bg-[#deded8] text-[#20211f] dark:bg-white/10 dark:text-[#f1f1ed]" : "text-[#5d5f59] hover:text-[#b9473e] dark:text-[#c6c7c0] dark:hover:text-[#ef7569]"}`}
                >
                  {t(labelKey)}
                </Link>
              ))}
              {!session?.user && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#d1d2cc] pt-3 sm:hidden dark:border-white/10">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-lg border border-[#b8b9b3] px-4 py-2.5 text-center text-sm font-bold dark:border-white/20"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-lg bg-[#20211f] px-4 py-2.5 text-center text-sm font-bold text-[#f5f5ef] dark:bg-[#d85f53] dark:text-[#1a1b19]"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
