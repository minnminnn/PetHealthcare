/**
 * app/layout.tsx — Minimal root layout (safety net)
 *
 * Why this file exists:
 * Next.js App Router requires at least one root layout with <html> and <body>.
 * When next-intl middleware correctly redirects all bare paths (e.g. /clinics →
 * /vi/clinics), this layout is never actually rendered — the real layout at
 * app/[locale]/layout.tsx handles everything.
 *
 * However, during development hot-reloads, 404 fallbacks, or misconfigured
 * middleware, Next.js may attempt to render a route without going through
 * [locale]/layout.tsx, which causes:
 *   "Missing required html tags: <html>, <body>"
 *
 * This root layout prevents that error by ensuring the <html>/<body> shell
 * always exists at the top of the tree, even for unmatched routes.
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
