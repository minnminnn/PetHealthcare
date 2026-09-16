import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PetPassportExperience } from "@/components/pets/passport/PetPassportExperience";
import type { Locale } from "@/i18n";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Digital Pet Passport",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: { locale: string; petId: string };
};

export default async function PetPassportPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    const callbackUrl = encodeURIComponent(
      `/${locale}/dashboard/pets/${params.petId}`,
    );
    redirect(`/${locale}/login?callbackUrl=${callbackUrl}`);
  }

  return <PetPassportExperience petId={params.petId} />;
}
