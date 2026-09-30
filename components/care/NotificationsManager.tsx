"use client";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { formatCareDate } from "@/lib/care/labels";
import { CareShell, Feedback, panelClass, secondaryClass } from "./CareShell";
export function NotificationsManager() {
  const vi = useLocale() === "vi";
  const notifications = api.notifications.list.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const mark = api.notifications.markRead.useMutation({
    onSuccess: async () => {
      await notifications.refetch();
    },
  });
  return (
    <CareShell title={vi ? "Thông báo" : "Notifications"}>
      <Feedback error={notifications.error?.message ?? mark.error?.message} />
      <button
        className={secondaryClass}
        disabled={notifications.isFetching}
        onClick={() => void notifications.refetch()}
      >
        {vi ? "Làm mới" : "Refresh"}
      </button>
      {notifications.isLoading && (
        <p role="status" className="mt-4">
          {vi ? "Đang tải…" : "Loading…"}
        </p>
      )}
      {notifications.data?.length === 0 && (
        <p className="mt-4">
          {vi ? "Chưa có thông báo." : "No notifications yet."}
        </p>
      )}
      <div className="mt-5 space-y-4">
        {notifications.data?.map((n) => (
          <article key={n.id} className={panelClass}>
            <h2 className="font-semibold">
              {!n.isRead && "● "}
              {n.title}
            </h2>
            <p className="mt-2 text-sm">{n.body}</p>
            <p className="mt-2 text-xs">{formatCareDate(n.createdAt, vi)}</p>
            <div className="mt-4 flex gap-3">
              {n.url && /^\/(vi|en)\/dashboard\//.test(n.url) && (
                <a
                  className={secondaryClass}
                  href={n.url.replace(
                    "/dashboard/owner/pets/",
                    "/dashboard/pets/",
                  )}
                >
                  {vi ? "Xem chi tiết" : "View details"}
                </a>
              )}
              {!n.isRead && (
                <button
                  className={secondaryClass}
                  disabled={mark.isPending}
                  onClick={() => mark.mutate({ id: n.id })}
                >
                  {vi ? "Đánh dấu đã đọc" : "Mark read"}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </CareShell>
  );
}
