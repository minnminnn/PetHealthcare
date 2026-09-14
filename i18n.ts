import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  /**
   * next-intl ≥ 3.22: requestLocale is a Promise<string | undefined>.
   * We must await it here. It can be undefined when a page renders outside
   * the [locale] segment (e.g. app/page.tsx fallback), so we provide a
   * safe default instead of crashing — which was the root cause of the
   * "Missing required html tags" error.
   */
  const localeRaw = await requestLocale;
  const locale: Locale = locales.includes(localeRaw as Locale)
    ? (localeRaw as Locale)
    : "vi";

  // For pages that intentionally live outside [locale], just skip.
  // For real invalid slugs, redirect to 404.
  if (localeRaw !== undefined && !locales.includes(localeRaw as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (
      await (locale === "vi"
        ? import("./messages/vi.json")
        : import("./messages/en.json"))
    ).default,
    timeZone: "Asia/Ho_Chi_Minh",
  };
});
