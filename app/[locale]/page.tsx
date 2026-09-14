import { setRequestLocale } from "next-intl/server";
import { HomeExperience } from "@/components/home/HomeExperience";
import type { Locale } from "@/i18n";

interface PageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return <HomeExperience locale={locale as Locale} />;
}
