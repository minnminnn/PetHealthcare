"use client";
import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/lib/navigation";

export const fieldClass =
  "mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#b9473e] dark:border-white/20 dark:bg-[#272824] dark:text-white";
export const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#b9473e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#953831] disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10";
export const panelClass =
  "rounded-2xl border border-black/10 bg-[#f8f8f5] p-5 dark:border-white/10 dark:bg-[#20211f] sm:p-7";
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="my-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="my-4 rounded-xl bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200"
        >
          {success}
        </p>
      )}
    </>
  );
}
export function CareShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const vi = useLocale() === "vi";
  const pathname = usePathname();
  const { data } = useSession();
  const role = data?.user.role;
  const links = [
    ["/dashboard/owner", vi ? "Tổng quan" : "Overview"],
    ["/dashboard/pets", vi ? "Thú cưng" : "Pets"],
    ["/dashboard/appointments", vi ? "Lịch khám" : "Appointments"],
    ["/dashboard/reminders", vi ? "Nhắc lịch" : "Reminders"],
    ["/dashboard/donors", vi ? "Hiến máu" : "Blood donors"],
    ["/dashboard/notifications", vi ? "Thông báo" : "Notifications"],
    ...(role && role !== "OWNER"
      ? [["/dashboard/clinic", vi ? "Phòng khám" : "Clinic"]]
      : []),
    ...(role === "SYSTEM_ADMIN"
      ? [["/dashboard/admin", vi ? "Duyệt phòng khám" : "Clinic approvals"]]
      : []),
  ];
  return (
    <div className="min-h-screen bg-[#efefeb] px-4 pb-24 pt-24 text-[#20211f] dark:bg-[#151614] dark:text-[#f1f1ed] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav
          aria-label={vi ? "Quản lý chăm sóc" : "Care management"}
          className="mb-8 flex flex-wrap gap-2"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href!}
              aria-current={pathname === href ? "page" : undefined}
              className={`${secondaryClass} ${pathname === href ? "bg-black/10 dark:bg-white/10" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
