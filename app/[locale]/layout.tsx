import "@/styles/globals.css";
import { type Metadata, type Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Inter, Roboto_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { SOSButton } from "@/components/layout/SOSButton";
import { locales, type Locale } from "@/i18n";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// ─── Static params for next-intl ──────────────────────────────────────────────
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "PetCare — Nền Tảng Sức Khỏe Thú Cưng Toàn Diện",
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
    title: "PetCare — Nền Tảng Sức Khỏe Thú Cưng Toàn Diện",
    description: "Tra cứu phòng khám thú y, hồ sơ y tế kỹ thuật số, tư vấn 24/7",
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

// ─── Root Layout ──────────────────────────────────────────────────────────────
interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
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
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://utfs.io" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider session={session}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TRPCReactProvider>
              {/* ── Global Navigation ────────────────────────── */}
              <Navbar locale={locale as Locale} />

              {/* ── Page Content ─────────────────────────────── */}
              <main className="min-h-[calc(100vh-4rem)] pt-16">
                {children}
              </main>

              {/* ── Persistent SOS Emergency FAB ─────────────── */}
              <SOSButton />

              {/* ── Toast Notifications ───────────────────────── */}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    fontFamily: "var(--font-geist-sans)",
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
