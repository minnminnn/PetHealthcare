"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PetPassportError({ reset }: { reset: () => void }) {
  const t = useTranslations("petPassport");

  return (
    <div className="passport-shell flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-3xl border border-black/10 bg-[#f8f8f5] p-8 text-center">
        <AlertTriangle
          className="mx-auto h-7 w-7 text-primary-600"
          aria-hidden="true"
        />
        <h1 className="mt-5 text-2xl text-secondary-900">{t("errorTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-secondary-600">
          {t("errorBody")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
