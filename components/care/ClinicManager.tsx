"use client";
import { useRef, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { AppointmentStatus, ClinicStatus, Species } from "@prisma/client";
import { api } from "@/trpc/react";
import { Link } from "@/lib/navigation";
import { formatCareDate, speciesLabels, statusLabels } from "@/lib/care/labels";
import {
  CareShell,
  Field,
  Feedback,
  buttonClass,
  fieldClass,
  panelClass,
  secondaryClass,
} from "./CareShell";
const nextStatuses: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
export function ClinicManager() {
  const vi = useLocale() === "vi";
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const clinics = api.management.myClinics.useQuery();
  const [selected, setSelected] = useState("");
  const [day, setDay] = useState(() =>
    new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10),
  );
  const clinicId = selected || clinics.data?.[0]?.id || "";
  const clinic = clinics.data?.find((c) => c.id === clinicId);
  const queue = api.appointments.clinicQueue.useQuery(
    { clinicId, day },
    { enabled: !!clinicId && !!day },
  );
  const update = api.appointments.updateStatus.useMutation({
    onSuccess: async () => {
      await queue.refetch();
    },
  });
  const addVet = api.management.addVet.useMutation({
    onSuccess: async () => {
      formRef.current?.reset();
      await clinics.refetch();
    },
  });
  const status = api.clinics.updateStatus.useMutation({
    onSuccess: async () => {
      await clinics.refetch();
    },
  });
  function submitVet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    addVet.mutate({
      clinicId,
      email: String(f.get("email")),
      licenseNumber: String(f.get("license")),
      specializations: f.getAll("species") as Species[],
    });
  }
  return (
    <CareShell
      title={vi ? "Quản lý phòng khám" : "Clinic management"}
      description={
        vi
          ? "Xác nhận lịch, tiếp nhận khám và mở hồ sơ để ghi kết quả. Lịch hiển thị theo giờ Việt Nam."
          : "Confirm appointments, start consultations and open passports to record clinical findings. Times are shown in Vietnam time."
      }
    >
      <Feedback
        error={
          clinics.error?.message ??
          queue.error?.message ??
          update.error?.message ??
          addVet.error?.message ??
          status.error?.message
        }
        success={
          addVet.isSuccess ? (vi ? "Đã thêm bác sĩ." : "Vet added.") : undefined
        }
      />
      {clinics.data?.length === 0 && (
        <p>
          {vi
            ? "Tài khoản chưa được gán phòng khám. Liên hệ quản trị viên."
            : "No clinic is assigned to this account. Contact an administrator."}
        </p>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field label={vi ? "Phòng khám" : "Clinic"}>
          <select
            value={clinicId}
            onChange={(e) => setSelected(e.target.value)}
            className={fieldClass}
          >
            {clinics.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={vi ? "Ngày khám" : "Date"}>
          <input
            type="date"
            required
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={fieldClass}
          />
        </Field>
      </div>
      <section className={panelClass}>
        <h2 className="text-xl font-semibold">
          {vi ? "Lịch trong ngày" : "Daily queue"}
        </h2>
        {queue.isFetching && (
          <p role="status" className="mt-4">
            {vi ? "Đang tải…" : "Loading…"}
          </p>
        )}
        {queue.data?.length === 0 && (
          <p className="mt-4">
            {vi
              ? "Chưa có lịch trong ngày này."
              : "No appointments for this day."}
          </p>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {queue.data?.map((a) => (
            <article
              key={a.id}
              className="rounded-xl border border-black/10 p-4 dark:border-white/10"
            >
              <h3 className="font-semibold">
                {a.pet.name} · {a.owner.name}
              </h3>
              <p className="mt-2 text-sm">
                {formatCareDate(a.scheduledAt, vi)} ·{" "}
                {statusLabels[a.status]?.[vi ? 0 : 1]}
              </p>
              <p className="mt-2 text-sm">
                {a.vet?.user.name ??
                  (vi ? "Chưa chỉ định bác sĩ" : "Unassigned vet")}
              </p>
              <p className="mt-2 text-sm">{a.chiefComplaint}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/pets/${a.pet.id}`}
                  className={buttonClass}
                >
                  {vi ? "Hồ sơ / ghi kết quả" : "Passport / add record"}
                </Link>
                {nextStatuses[a.status].map((value) => (
                  <button
                    key={value}
                    disabled={update.isPending}
                    className={secondaryClass}
                    onClick={() =>
                      update.mutate({ appointmentId: a.id, status: value })
                    }
                  >
                    {statusLabels[value]?.[vi ? 0 : 1]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      {clinic && session?.user.role !== "VET" && (
        <section className={`${panelClass} mt-6`}>
          <h2 className="text-xl font-semibold">
            {vi ? "Vận hành và bác sĩ" : "Operations and vets"}
          </h2>
          <div className="mt-4 max-w-sm">
            <Field label={vi ? "Trạng thái phòng khám" : "Clinic status"}>
              <select
                value={clinic.status}
                disabled={status.isPending}
                onChange={(e) =>
                  status.mutate({
                    clinicId,
                    status: e.target.value as ClinicStatus,
                  })
                }
                className={fieldClass}
              >
                {Object.entries({
                  AVAILABLE: ["Đang hoạt động", "Available"],
                  BUSY: ["Đông khách", "Busy"],
                  EMERGENCY: ["Trực cấp cứu", "Emergency"],
                  CLOSED: ["Đóng cửa", "Closed"],
                }).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label[vi ? 0 : 1]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <ul className="my-5 space-y-2 text-sm">
            {clinic.vets.map((v) => (
              <li key={v.id}>
                {v.user.name} · {v.user.email} · {v.licenseNumber}
              </li>
            ))}
          </ul>
          <form ref={formRef} onSubmit={submitVet} className="space-y-4">
            <h3 className="font-semibold">
              {vi
                ? "Thêm bác sĩ từ tài khoản đã đăng ký"
                : "Add a vet from a registered account"}
            </h3>
            <p className="text-sm">
              {vi
                ? "Chỉ thêm sau khi đã kiểm tra thông tin và giấy phép hành nghề."
                : "Add only after reviewing identity and professional credentials."}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  required
                  className={fieldClass}
                />
              </Field>
              <Field label={vi ? "Mã giấy phép" : "License number"}>
                <input
                  name="license"
                  required
                  minLength={3}
                  maxLength={100}
                  className={fieldClass}
                />
              </Field>
            </div>
            <fieldset>
              <legend className="text-sm font-medium">
                {vi
                  ? "Loài tiếp nhận (chọn ít nhất một)"
                  : "Supported species (select at least one)"}
              </legend>
              <div className="mt-3 flex flex-wrap gap-4">
                {Object.entries(speciesLabels).map(([key, labels]) => (
                  <label className="flex items-center gap-2 text-sm" key={key}>
                    <input type="checkbox" name="species" value={key} />
                    {labels[vi ? 0 : 1]}
                  </label>
                ))}
              </div>
            </fieldset>
            <button disabled={addVet.isPending} className={buttonClass}>
              {vi ? "Thêm bác sĩ" : "Add vet"}
            </button>
          </form>
        </section>
      )}
    </CareShell>
  );
}
