import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";
import { EmergencyExperience } from "@/components/emergency/EmergencyExperience";

interface PageProps {
  params: { locale: string };
}

export default function EmergencyPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return <EmergencyExperience locale={locale === "en" ? "en" : "vi"} />;
}
