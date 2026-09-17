import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";
import { TeleVetExperience } from "@/components/tele-vet/TeleVetExperience";

interface PageProps {
  params: { locale: string };
}

export default function TeleVetPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return <TeleVetExperience locale={locale === "vi" ? "vi" : "en"} />;
}
