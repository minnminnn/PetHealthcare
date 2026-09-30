"use client";
import { useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { Link } from "@/lib/navigation";
import { formatCareDate, statusLabels } from "@/lib/care/labels";
import { getClinicDisplayName } from "@/lib/care/display";
import {
  CareShell,
  Field,
  Feedback,
  buttonClass,
  fieldClass,
  panelClass,
  secondaryClass,
} from "./CareShell";

export function AppointmentsManager({
  initialClinicId = "",
  initialVetId = "",
}: {
  initialClinicId?: string;
  initialVetId?: string;
}) {
  const vi = useLocale() === "vi";
  const [page, setPage] = useState(1);
  const [petId, setPetId] = useState("");
  const [clinicId, setClinicId] = useState(initialClinicId);
  const [vetId, setVetId] = useState(initialVetId);
  const [success, setSuccess] = useState("");
  const pets = api.pets.list.useQuery();
  const options = api.management.bookingOptions.useQuery();
  const appointments = api.appointments.myAppointments.useQuery({
    page,
    limit: 10,
  });
  const book = api.appointments.book.useMutation({
    onSuccess: async () => {
      setSuccess(
        vi
          ? "Đã gửi yêu cầu. Phòng khám sẽ xác nhận lịch trước khi bạn đến."
          : "Request sent. Wait for the clinic to confirm before travelling.",
      );
      setPage(1);
      await appointments.refetch();
    },
  });
  const cancel = api.appointments.cancel.useMutation({
    onSuccess: async () => {
      await appointments.refetch();
    },
  });
  const selectedPet = pets.data?.find((p) => p.id === petId);
  const clinics =
    options.data?.filter(
      (c) =>
        !selectedPet ||
        !c.specializations.length ||
        c.specializations.includes(selectedPet.species),
    ) ?? [];
  const selectedClinic = clinics.find((c) => c.id === clinicId);
  const vets =
    selectedClinic?.vets.filter(
      (v) =>
        !selectedPet ||
        !v.specializations.length ||
        v.specializations.includes(selectedPet.species),
    ) ?? [];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    cancel.reset();
    const form = new FormData(event.currentTarget);
    book.mutate({
      petId,
      clinicId,
      vetId: vetId || undefined,
      type: form.get("type") as "IN_PERSON" | "FOLLOW_UP",
      scheduledAt: new Date(String(form.get("time"))),
      durationMinutes: Number(form.get("duration")),
      chiefComplaint: String(form.get("complaint")),
    });
  }
  return (
    <CareShell
      title={vi ? "Lịch khám" : "Appointments"}
      description={
        vi
          ? "Đặt lịch khám tại phòng khám hoặc tái khám. Giờ nhập theo thiết bị; danh sách hiển thị theo giờ Việt Nam."
          : "Request an in-person appointment or follow-up. Enter your device's local time; appointments display in Vietnam time."
      }
    >
      <Feedback
        error={
          book.error?.message ??
          cancel.error?.message ??
          options.error?.message ??
          pets.error?.message ??
          appointments.error?.message
        }
        success={success}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Đặt lịch mới" : "New appointment"}
          </h2>
          {pets.data?.length === 0 ? (
            <p className="mt-4">
              <Link className={buttonClass} href="/dashboard/pets">
                {vi ? "Thêm thú cưng trước" : "Add your first pet"}
              </Link>
            </p>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={submit}>
              <Field label={vi ? "Thú cưng *" : "Pet *"}>
                <select
                  required
                  value={petId}
                  onChange={(e) => {
                    setPetId(e.target.value);
                    setClinicId("");
                    setVetId("");
                  }}
                  className={fieldClass}
                >
                  <option value="">
                    {vi ? "Chọn thú cưng" : "Choose a pet"}
                  </option>
                  {pets.data?.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={vi ? "Phòng khám *" : "Clinic *"}>
                <select
                  required
                  value={clinicId}
                  onChange={(e) => {
                    setClinicId(e.target.value);
                    setVetId("");
                  }}
                  className={fieldClass}
                >
                  <option value="">
                    {vi ? "Chọn phòng khám" : "Choose a clinic"}
                  </option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getClinicDisplayName(c.name)} · {c.city}
                    </option>
                  ))}
                </select>
              </Field>
              {options.isSuccess && !clinics.length && (
                <p className="text-sm">
                  {vi
                    ? "Chưa có phòng khám phù hợp đã được duyệt."
                    : "No approved clinic matches this pet yet."}
                </p>
              )}
              {selectedClinic && (
                <p className="text-sm">{selectedClinic.address}</p>
              )}
              <Field label={vi ? "Bác sĩ" : "Vet"}>
                <select
                  value={vetId}
                  onChange={(e) => setVetId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">
                    {vi ? "Phòng khám sắp xếp" : "Assigned by the clinic"}
                  </option>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.user.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={vi ? "Thời gian *" : "Date and time *"}>
                  <input
                    required
                    name="time"
                    type="datetime-local"
                    className={fieldClass}
                  />
                </Field>
                <Field label={vi ? "Thời lượng" : "Duration"}>
                  <select
                    name="duration"
                    defaultValue="30"
                    className={fieldClass}
                  >
                    {[15, 30, 45, 60].map((n) => (
                      <option key={n} value={n}>
                        {n} {vi ? "phút" : "minutes"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label={vi ? "Loại lịch" : "Appointment type"}>
                <select name="type" className={fieldClass}>
                  <option value="IN_PERSON">
                    {vi ? "Khám tại phòng khám" : "In-person"}
                  </option>
                  <option value="FOLLOW_UP">
                    {vi ? "Tái khám" : "Follow-up"}
                  </option>
                </select>
              </Field>
              <Field label={vi ? "Lý do khám" : "Reason for visit"}>
                <textarea
                  name="complaint"
                  rows={3}
                  maxLength={500}
                  className={fieldClass}
                />
              </Field>
              <button
                className={buttonClass}
                disabled={
                  book.isPending ||
                  !selectedClinic ||
                  !selectedPet ||
                  (!!vetId && !vets.some((v) => v.id === vetId))
                }
              >
                {book.isPending
                  ? vi
                    ? "Đang gửi…"
                    : "Sending…"
                  : vi
                    ? "Gửi yêu cầu đặt lịch"
                    : "Request appointment"}
              </button>
            </form>
          )}
        </section>
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Lịch của bạn" : "Your appointments"}
          </h2>
          {appointments.isLoading && (
            <p className="mt-4" role="status">
              {vi ? "Đang tải…" : "Loading…"}
            </p>
          )}
          {appointments.data?.length === 0 && (
            <p className="mt-4">
              {vi
                ? "Chưa có lịch khám ở trang này."
                : "No appointments on this page."}
            </p>
          )}
          <div className="mt-5 space-y-3">
            {appointments.data?.map((a) => (
              <article
                key={a.id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <p className="font-semibold">
                  {a.pet.name} · {getClinicDisplayName(a.clinic.name)}
                </p>
                <p className="mt-2 text-sm">
                  {formatCareDate(a.scheduledAt, vi)} · {a.durationMinutes}{" "}
                  {vi ? "phút" : "minutes"}
                </p>
                <p className="mt-2 text-sm">
                  {statusLabels[a.status]?.[vi ? 0 : 1]}
                  {a.vet?.user.name ? ` · ${a.vet.user.name}` : ""}
                </p>
                {["PENDING", "CONFIRMED"].includes(a.status) && (
                  <button
                    className={`${secondaryClass} mt-3`}
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate({ appointmentId: a.id })}
                  >
                    {vi ? "Hủy lịch" : "Cancel"}
                  </button>
                )}
              </article>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              className={secondaryClass}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              {vi ? "Trước" : "Previous"}
            </button>
            <span>{page}</span>
            <button
              className={secondaryClass}
              disabled={!appointments.data || appointments.data.length < 10}
              onClick={() => setPage(page + 1)}
            >
              {vi ? "Sau" : "Next"}
            </button>
          </div>
        </section>
      </div>
    </CareShell>
  );
}
