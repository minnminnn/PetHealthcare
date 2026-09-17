
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { type Metadata, type Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { SOSButton } from "@/components/layout/SOSButton";
import { locales, type Locale } from "@/i18n";


// ─── Static params for next-intl ──────────────────────────────────────────────
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "PetCare - Nền Tảng Sức Khỏe Thú Cưng Toàn Diện",
    template: "%s | PetCare Vietnam",
  },
  description:
    "Tra cứu phòng khám thú y, hồ sơ y tế kỹ thuật số, tư vấn bác sĩ online 24/7. Nền tảng chăm sóc thú cưng toàn diện tại Việt Nam.",
  keywords: [
    "phòng khám thú y",
    "bác sĩ thú y",
    "pet healthcare",
    "thú cưng",
    "mèo",
    "chó",
    "tư vấn thú y online",
    "hồ sơ y tế thú cưng",
  ],
  authors: [{ name: "PetCare Vietnam" }],
  creator: "PetCare Vietnam",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    alternateLocale: "en_US",
    title: "PetCare - Nền Tảng Sức Khỏe Thú Cưng Toàn Diện",
    description:
      "Tra cứu phòng khám thú y, hồ sơ y tế kỹ thuật số, tư vấn 24/7",
    siteName: "PetCare Vietnam",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetCare Vietnam",
    description: "Nền tảng sức khỏe thú cưng toàn diện",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0284C7",
  width: "device-width",
  initialScale: 1,
};

const exceptNavbar = ["/login", "/register"];

// ─── Root Layout ──────────────────────────────────────────────────────────────
interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // Enable SSR for next-intl
  setRequestLocale(locale as Locale);

  // Load messages for the locale
  const messages = (
    await (locale === "vi"
      ? import("@/messages/vi.json")
      : import("@/messages/en.json"))
  ).default;

  const session = await auth();


  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/inter-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://utfs.io" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider session={session}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TRPCReactProvider>
              {/* ── Global Navigation ────────────────────────── */}
              <Navbar locale={locale as Locale} />

              {/* ── Page Content ─────────────────────────────── */}
              <main className="min-h-[100dvh]">{children}</main>

              {/* ── Persistent SOS Emergency FAB ─────────────── */}
              <SOSButton />

              {/* ── Toast Notifications ───────────────────────── */}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#f3f3f0",
                    color: "#20211f",
                    border: "1px solid #d7d7d1",
                    borderRadius: "12px",
                    fontFamily: "InterVariable, sans-serif",
                  },
                }}
              />
            </TRPCReactProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
