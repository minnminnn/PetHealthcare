"use client";
import { useRef, useState, type FormEvent } from "react";
import { ReminderType } from "@prisma/client";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { Link } from "@/lib/navigation";
import { formatCareDate, reminderLabels } from "@/lib/care/labels";
import {
  CareShell,
  Field,
  Feedback,
  buttonClass,
  fieldClass,
  panelClass,
  secondaryClass,
} from "./CareShell";

export function RemindersManager() {
  const vi = useLocale() === "vi";
  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState("");
  const pets = api.pets.list.useQuery();
  const reminders = api.reminders.list.useQuery({});
  const create = api.reminders.create.useMutation({
    onSuccess: async () => {
      formRef.current?.reset();
      setSuccess(vi ? "Đã lưu nhắc lịch." : "Reminder saved.");
      await reminders.refetch();
    },
  });
  const toggle = api.reminders.toggle.useMutation({
    onSuccess: async () => {
      await reminders.refetch();
    },
  });
  const remove = api.reminders.delete.useMutation({
    onSuccess: async () => {
      await reminders.refetch();
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    const form = new FormData(event.currentTarget);
    create.mutate({
      petId: String(form.get("petId")),
      title: String(form.get("title")),
      type: form.get("type") as ReminderType,
      dueAt: new Date(String(form.get("dueAt"))),
      repeatDays: form.get("repeatDays")
        ? Number(form.get("repeatDays"))
        : undefined,
      channel: form.get("email") === "on" ? ["IN_APP", "EMAIL"] : ["IN_APP"],
    });
  }
  return (
    <CareShell
      title={vi ? "Nhắc lịch chăm sóc" : "Care reminders"}
      description={
        vi
          ? "Theo dõi các việc cần làm. Nhắc lịch đến hạn xuất hiện trong mục Thông báo; email cần được cấu hình bởi quản trị viên."
          : "Keep track of care tasks. Due reminders appear in Notifications; email requires administrator configuration."
      }
    >
      <Feedback
        error={
          create.error?.message ??
          toggle.error?.message ??
          remove.error?.message ??
          reminders.error?.message ??
          pets.error?.message
        }
        success={success}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Tạo nhắc lịch" : "Create reminder"}
          </h2>
          {pets.data?.length === 0 ? (
            <Link href="/dashboard/pets" className={`${buttonClass} mt-4`}>
              {vi ? "Thêm thú cưng" : "Add a pet"}
            </Link>
          ) : (
            <form ref={formRef} onSubmit={submit} className="mt-5 space-y-4">
              <Field label={vi ? "Thú cưng" : "Pet"}>
                <select required name="petId" className={fieldClass}>
                  <option value="">
                    {vi ? "Chọn thú cưng" : "Choose a pet"}
                  </option>
                  {pets.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={vi ? "Nội dung" : "Title"}>
                <input
                  required
                  name="title"
                  maxLength={200}
                  className={fieldClass}
                />
              </Field>
              <Field label={vi ? "Loại" : "Type"}>
                <select name="type" className={fieldClass}>
                  {Object.entries(reminderLabels).map(([key, labels]) => (
                    <option key={key} value={key}>
                      {labels[vi ? 0 : 1]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={
                  vi
                    ? "Thời gian theo thiết bị"
                    : "Time in your device's timezone"
                }
              >
                <input
                  required
                  type="datetime-local"
                  name="dueAt"
                  className={fieldClass}
                />
              </Field>
              <Field
                label={
                  vi
                    ? "Lặp lại sau số ngày (để trống nếu chỉ một lần)"
                    : "Repeat every N days (leave blank for once)"
                }
              >
                <input
                  type="number"
                  name="repeatDays"
                  min={1}
                  max={3650}
                  step={1}
                  className={fieldClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="email" />
                {vi ? "Gửi thêm email" : "Also send email"}
              </label>
              <button
                className={buttonClass}
                disabled={create.isPending || !pets.data?.length}
              >
                {create.isPending
                  ? vi
                    ? "Đang lưu…"
                    : "Saving…"
                  : vi
                    ? "Lưu nhắc lịch"
                    : "Save reminder"}
              </button>
            </form>
          )}
        </section>
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Danh sách nhắc lịch" : "Your reminders"}
          </h2>
          {reminders.isLoading && (
            <p role="status" className="mt-4">
              {vi ? "Đang tải…" : "Loading…"}
            </p>
          )}
          {reminders.data?.length === 0 && (
            <p className="mt-4">
              {vi ? "Chưa có nhắc lịch." : "No reminders yet."}
            </p>
          )}
          <div className="mt-5 space-y-3">
            {reminders.data?.map((r) => (
              <article
                key={r.id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <p className="font-semibold">
                  {r.pet.name} · {r.title}
                </p>
                <p className="mt-2 text-sm">{formatCareDate(r.dueAt, vi)}</p>
                <p className="mt-2 text-sm">
                  {r.isSent
                    ? vi
                      ? "Đã gửi"
                      : "Sent"
                    : r.isActive
                      ? vi
                        ? "Đang bật"
                        : "Active"
                      : vi
                        ? "Đang tắt"
                        : "Paused"}
                  {r.repeatDays
                    ? ` · ${vi ? "Mỗi" : "Every"} ${r.repeatDays} ${vi ? "ngày" : "days"}`
                    : ""}
                </p>
                {!r.isSent && (
                  <div className="mt-3 flex gap-2">
                    <button
                      className={secondaryClass}
                      disabled={toggle.isPending}
                      onClick={() =>
                        toggle.mutate({
                          reminderId: r.id,
                          isActive: !r.isActive,
                        })
                      }
                    >
                      {r.isActive
                        ? vi
                          ? "Tắt"
                          : "Pause"
                        : vi
                          ? "Bật"
                          : "Resume"}
                    </button>
                    <button
                      className={secondaryClass}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate({ reminderId: r.id })}
                    >
                      {vi ? "Xóa" : "Delete"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </CareShell>
  );
}
