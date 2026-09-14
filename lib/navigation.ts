/**
 * lib/navigation.ts
 *
 * Central export for next-intl locale-aware navigation primitives.
 * Import Link, redirect, useRouter, usePathname from HERE — never from
 * "next/link" or "next/navigation" inside pages/components that need
 * locale-prefixed routing.
 *
 * This ensures every generated URL is automatically prefixed with the
 * active locale (e.g. /clinics → /vi/clinics) and the <html lang="...">
 * always comes from app/[locale]/layout.tsx.
 */
import { createNavigation } from "next-intl/navigation";
import { locales } from "@/i18n";

export const {
  Link,          // Locale-aware drop-in for next/link
  redirect,      // Locale-aware drop-in for next/navigation redirect (server)
  useRouter,     // Locale-aware drop-in for next/navigation useRouter (client)
  usePathname,   // Returns pathname WITHOUT locale prefix
} = createNavigation({
  locales,
  defaultLocale: "vi" as const,
  localePrefix: "always",
});
