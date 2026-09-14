/**
 * middleware.ts — Root middleware (runs at the Edge before every request)
 *
 * Responsibilities:
 * 1. next-intl locale detection & prefix enforcement (e.g. /clinics → /vi/clinics).
 * 2. Auth guard: redirect unauthenticated users away from protected routes.
 *
 * IMPORTANT: createMiddleware from next-intl MUST run on every matched request
 * so that it can set the X-NEXT-INTL-LOCALE response header that tells
 * app/[locale]/layout.tsx which locale to load. Skipping this causes the
 * "Missing required html tags" error because the request falls outside
 * the [locale] segment tree.
 */

import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { locales } from "@/i18n";

// ── next-intl middleware instance ─────────────────────────────────────────────
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "vi",
  localePrefix: "always",   // Every URL must have /vi/ or /en/ prefix
});

// ── Routes that require a valid session cookie ────────────────────────────────
const PROTECTED_PREFIXES = ["/dashboard", "/tele-vet", "/blood-donor"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Strip locale prefix for route-pattern matching ─────────────────────
  //    e.g. "/vi/dashboard/owner" → "/dashboard/owner"
  const localeRegex = new RegExp(`^/(${locales.join("|")})`);
  const pathnameWithoutLocale = pathname.replace(localeRegex, "") || "/";

  // ── 2. Auth guard for protected routes ────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathnameWithoutLocale.startsWith(prefix),
  );

  if (isProtected) {
    // NextAuth v5 JWT session cookie names (both plain and Secure variants)
    const sessionToken =
      request.cookies.get("authjs.session-token") ??
      request.cookies.get("__Secure-authjs.session-token");

    if (!sessionToken) {
      // Detect the locale from the URL so the redirect itself is also prefixed.
      const localeMatch = pathname.match(localeRegex);
      const locale = localeMatch ? localeMatch[1] : "vi";

      const loginUrl = new URL(
        `/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`,
        request.url,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 3. Hand off to next-intl — this MUST run for every non-redirected request
  //    so that locale context is injected and app/[locale]/layout.tsx is matched.
  return intlMiddleware(request);
}

export const config = {
  /**
   * Match every path EXCEPT:
   *   - /api/** (Next.js API routes & tRPC)
   *   - /_next/** (build artifacts)
   *   - Static file extensions
   *
   * Using the official next-intl recommended matcher pattern.
   */
  matcher: [
    // Match root
    "/",
    // Match locale-only paths: /vi, /en
    "/(vi|en)",
    // Match locale-prefixed paths: /vi/*, /en/*
    "/(vi|en)/:path*",
    // Also catch non-prefixed paths so next-intl can redirect them to /{locale}/...
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
