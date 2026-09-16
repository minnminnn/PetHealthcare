import { PawPrint, ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

type PageProps = { params: { locale: string } };

export default async function PetsPassportIndexPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user) {
    redirect(
      `/${locale}/login?callbackUrl=${encodeURIComponent(`/${locale}/dashboard/pets`)}`,
    );
  }

  const firstPet = await db.pet.findFirst({
    where: { ownerId: session.user.id, isActive: true },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  if (firstPet) redirect(`/${locale}/dashboard/pets/${firstPet.id}`);

  const t = await getTranslations("petPassport");
  return (
    <main className="passport-shell flex min-h-[80vh] items-center justify-center bg-[#efefeb] px-4 pt-20">
      <div className="max-w-lg rounded-[28px] border border-black/10 bg-[#f8f8f5] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-900 text-white">
          <PawPrint className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-secondary-900">
          {t("noPetsTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary-600">
          {t("noPetsBody")}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary-100 px-3.5 py-2.5 text-sm font-medium text-secondary-700">
          <ShieldCheck
            className="h-4 w-4 text-primary-600"
            aria-hidden="true"
          />
          {t("privateByDefault")}
        </div>
      </div>
    </main>
  );
}
