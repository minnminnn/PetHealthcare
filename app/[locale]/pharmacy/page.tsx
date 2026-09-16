import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";
import { PharmacyExperience } from "@/components/pharmacy/PharmacyExperience";

interface PageProps {
  params: { locale: string };
}

export default function PharmacyPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return <PharmacyExperience locale={locale === "en" ? "en" : "vi"} />;
}
