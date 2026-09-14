import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";
import { ClinicsExperience } from "@/components/clinics/ClinicsExperience";

interface PageProps {
  params: { locale: string };
}

export default function ClinicsPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return <ClinicsExperience locale={locale === "en" ? "en" : "vi"} />;
}
