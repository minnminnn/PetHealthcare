"use client";
import { useState, type FormEvent } from "react";
import { BloodType, Species } from "@prisma/client";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { formatCareDate } from "@/lib/care/labels";
import {
  CareShell,
  Field,
  Feedback,
  buttonClass,
  fieldClass,
  panelClass,
  secondaryClass,
} from "./CareShell";

const donorStatus = {
  PENDING_REVIEW: ["Chờ khám sàng lọc", "Pending screening"],
  ELIGIBLE: ["Đã duyệt", "Approved"],
  INELIGIBLE: ["Chưa đủ điều kiện", "Not eligible"],
  ON_HOLD: ["Tạm dừng", "On hold"],
};
export function DonorManager() {
  const vi = useLocale() === "vi";
  const { data: session } = useSession();
  return (
    <CareShell
      title={vi ? "Đăng ký và điều phối hiến máu" : "Blood donor coordination"}
      description={
        vi
          ? "Đăng ký cần được phòng khám khám sàng lọc và duyệt. Đồng ý hỗ trợ không thay thế kiểm tra tương thích trước truyền máu."
          : "A clinic must screen and approve donor applications. Accepting a request does not replace compatibility testing."
      }
    >
      <OwnerDonors vi={vi} />
      {session?.user.role && session.user.role !== "OWNER" && (
        <ClinicDonors vi={vi} />
      )}
    </CareShell>
  );
}
function OwnerDonors({ vi }: { vi: boolean }) {
  const pets = api.pets.list.useQuery();
  const alerts = api.bloodDonor.myAlerts.useQuery();
  const register = api.bloodDonor.register.useMutation({
    onSuccess: async () => {
      await pets.refetch();
    },
  });
  const withdraw = api.bloodDonor.withdraw.useMutation({
    onSuccess: async () => {
      await pets.refetch();
      await alerts.refetch();
    },
  });
  const respond = api.bloodDonor.respond.useMutation({
    onSuccess: async () => {
      await alerts.refetch();
    },
  });
  const eligibleSpecies =
    pets.data?.filter((p) => p.species === "DOG" || p.species === "CAT") ?? [];
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    register.mutate({
      petId: String(f.get("petId")),
      city: String(f.get("city")),
      healthNotes: String(f.get("notes")),
      ownerConsent: true,
    });
  }
  return (
    <>
      <Feedback
        error={
          pets.error?.message ??
          alerts.error?.message ??
          register.error?.message ??
          withdraw.error?.message ??
          respond.error?.message
        }
        success={
          register.isSuccess
            ? vi
              ? "Đã đăng ký, vui lòng đặt lịch với phòng khám để sàng lọc."
              : "Application saved. Book a clinic appointment for screening."
            : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Đăng ký thú cưng" : "Register your pet"}
          </h2>
          {!eligibleSpecies.length && (
            <p className="mt-4 text-sm">
              {vi
                ? "Thêm hồ sơ chó hoặc mèo trước khi đăng ký."
                : "Add a cat or dog profile before applying."}
            </p>
          )}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label={vi ? "Thú cưng" : "Pet"}>
              <select name="petId" required className={fieldClass}>
                <option value="">
                  {vi ? "Chọn thú cưng" : "Choose a pet"}
                </option>
                {eligibleSpecies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={vi ? "Tỉnh / thành" : "City"}>
              <input
                name="city"
                required
                minLength={2}
                maxLength={100}
                className={fieldClass}
              />
            </Field>
            <Field label={vi ? "Ghi chú sức khỏe" : "Health notes"}>
              <textarea name="notes" maxLength={2000} className={fieldClass} />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required />
              {vi
                ? "Tôi đồng ý đăng ký, cho phép phòng khám liên hệ và sẽ xác nhận từng lần hiến."
                : "I consent to registration and clinic contact, and will confirm each donation separately."}
            </label>
            <button
              className={buttonClass}
              disabled={register.isPending || !eligibleSpecies.length}
            >
              {vi ? "Gửi đăng ký" : "Apply"}
            </button>
          </form>
          <div className="mt-5 space-y-3">
            {eligibleSpecies
              .filter((p) => p.bloodDonor)
              .map((p) => (
                <div
                  key={p.id}
                  className="border-t border-black/10 pt-3 text-sm"
                >
                  <p>
                    {p.name} · {donorStatus[p.bloodDonor!.status][vi ? 0 : 1]}
                  </p>
                  {p.bloodDonor!.ownerConsent && (
                    <button
                      className={`${secondaryClass} mt-2`}
                      disabled={withdraw.isPending}
                      onClick={() => withdraw.mutate({ petId: p.id })}
                    >
                      {vi ? "Rút đăng ký" : "Withdraw consent"}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </section>
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Yêu cầu hỗ trợ" : "Donation requests"}
          </h2>
          {alerts.data?.length === 0 && (
            <p className="mt-4 text-sm">
              {vi ? "Chưa có yêu cầu phù hợp." : "No matching requests."}
            </p>
          )}
          <div className="mt-5 space-y-3">
            {alerts.data?.map((a) => (
              <article
                key={a.id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <h3 className="font-semibold">
                  {a.donorProfile.pet.name} · {a.request.clinic.name}
                </h3>
                <p className="mt-2 text-sm">{a.request.description}</p>
                <p className="mt-2 text-sm">
                  {a.request.clinic.phone} · {a.request.clinic.address}
                </p>
                <p className="mt-2 text-sm">
                  {formatCareDate(a.request.expiresAt, vi)}
                </p>
                <p className="mt-2 text-sm">
                  {a.isAccepted === null
                    ? vi
                      ? "Chưa trả lời"
                      : "Awaiting response"
                    : a.isAccepted
                      ? vi
                        ? "Đã đồng ý liên hệ"
                        : "Contact accepted"
                      : vi
                        ? "Đã từ chối"
                        : "Declined"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className={buttonClass}
                    disabled={respond.isPending}
                    onClick={() =>
                      respond.mutate({ alertId: a.id, accept: true })
                    }
                  >
                    {vi ? "Có thể hỗ trợ" : "Available to help"}
                  </button>
                  <button
                    className={secondaryClass}
                    disabled={respond.isPending}
                    onClick={() =>
                      respond.mutate({ alertId: a.id, accept: false })
                    }
                  >
                    {vi ? "Không thể" : "Unavailable"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
function ClinicDonors({ vi }: { vi: boolean }) {
  const clinics = api.management.myClinics.useQuery();
  const [selected, setSelected] = useState("");
  const clinicId = selected || clinics.data?.[0]?.id || "";
  const donors = api.bloodDonor.clinicDonors.useQuery(
    { clinicId },
    { enabled: !!clinicId },
  );
  const requests = api.bloodDonor.clinicRequests.useQuery(
    { clinicId },
    { enabled: !!clinicId },
  );
  const review = api.bloodDonor.review.useMutation({
    onSuccess: async () => {
      await donors.refetch();
    },
  });
  const create = api.bloodDonor.createRequest.useMutation({
    onSuccess: async () => {
      await requests.refetch();
    },
  });
  function submitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate({
      clinicId,
      species: f.get("species") as Species,
      bloodType: f.get("bloodType") as BloodType,
      urgency: "urgent",
      description: String(f.get("description")),
      expiresAt: new Date(String(f.get("expiresAt"))),
    });
  }
  return (
    <section className={`${panelClass} mt-6`}>
      <h2 className="text-xl font-semibold">
        {vi ? "Điều phối tại phòng khám" : "Clinic coordination"}
      </h2>
      <Feedback
        error={
          clinics.error?.message ??
          donors.error?.message ??
          requests.error?.message ??
          review.error?.message ??
          create.error?.message
        }
      />
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
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {donors.data?.map((d) => (
          <form
            key={d.id}
            className="space-y-3 rounded-xl border border-black/10 p-4 dark:border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              review.mutate({
                petId: d.petId,
                status: f.get("status") as
                  "ELIGIBLE" | "INELIGIBLE" | "ON_HOLD",
                bloodType: f.get("bloodType") as BloodType,
                isVaccinated: f.get("vaccinated") === "on",
                reviewed: true,
              });
            }}
          >
            <h3 className="font-semibold">
              {d.pet.name} · {d.pet.owner.name}
            </h3>
            <p className="text-sm">{d.healthNotes}</p>
            <p className="text-sm">{donorStatus[d.status][vi ? 0 : 1]}</p>
            <Field label={vi ? "Nhóm máu đã xét nghiệm" : "Tested blood type"}>
              <select
                name="bloodType"
                required
                className={fieldClass}
                defaultValue={d.bloodType === "UNKNOWN" ? "" : d.bloodType}
              >
                <option value="">—</option>
                {Object.values(BloodType)
                  .filter((b) =>
                    d.pet.species === "CAT"
                      ? b.startsWith("FELINE_")
                      : b.startsWith("DEA"),
                  )
                  .map((b) => (
                    <option key={b}>{b}</option>
                  ))}
              </select>
            </Field>
            <Field label={vi ? "Kết quả sàng lọc" : "Screening result"}>
              <select name="status" className={fieldClass}>
                <option value="ON_HOLD">{vi ? "Tạm dừng" : "On hold"}</option>
                <option value="ELIGIBLE">
                  {vi ? "Đủ điều kiện" : "Eligible"}
                </option>
                <option value="INELIGIBLE">
                  {vi ? "Chưa đủ điều kiện" : "Not eligible"}
                </option>
              </select>
            </Field>
            <label className="flex gap-2 text-sm">
              <input
                name="vaccinated"
                type="checkbox"
                defaultChecked={d.isVaccinated}
              />
              {vi ? "Đã xác minh tiêm chủng" : "Vaccination verified"}
            </label>
            <label className="flex gap-2 text-sm">
              <input required type="checkbox" />
              {vi
                ? "Đã khám sàng lọc trực tiếp"
                : "Clinical screening completed"}
            </label>
            <button className={buttonClass} disabled={review.isPending}>
              {vi ? "Lưu đánh giá" : "Save review"}
            </button>
          </form>
        ))}
      </div>
      <form onSubmit={submitRequest} className="mt-8 space-y-4">
        <h3 className="font-semibold">
          {vi ? "Tạo yêu cầu hỗ trợ" : "Create a request"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={vi ? "Loài" : "Species"}>
            <select name="species" className={fieldClass}>
              <option value="DOG">{vi ? "Chó" : "Dog"}</option>
              <option value="CAT">{vi ? "Mèo" : "Cat"}</option>
            </select>
          </Field>
          <Field label={vi ? "Nhóm máu" : "Blood type"}>
            <select name="bloodType" className={fieldClass}>
              {Object.values(BloodType)
                .filter((b) => b !== "UNKNOWN")
                .map((b) => (
                  <option key={b}>{b}</option>
                ))}
            </select>
          </Field>
        </div>
        <Field label={vi ? "Nội dung" : "Description"}>
          <textarea
            name="description"
            maxLength={2000}
            className={fieldClass}
          />
        </Field>
        <Field label={vi ? "Hết hạn (giờ thiết bị)" : "Expires (device time)"}>
          <input
            type="datetime-local"
            required
            name="expiresAt"
            className={fieldClass}
          />
        </Field>
        <button
          disabled={!clinicId || create.isPending}
          className={buttonClass}
        >
          {vi ? "Tạo yêu cầu" : "Create request"}
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {requests.data?.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-black/10 p-4 dark:border-white/10"
          >
            <p className="font-semibold">
              {r.bloodType} · {formatCareDate(r.expiresAt, vi)}
            </p>
            <p className="mt-2 text-sm">{r.description}</p>
            <p className="mt-2 text-sm">
              {vi ? "Đã đồng ý hỗ trợ:" : "Accepted:"} {r.donationAlerts.length}
            </p>
            {r.donationAlerts.map((a) => (
              <p className="mt-2 text-sm" key={a.id}>
                {a.donorProfile.pet.name} · {a.donorProfile.pet.owner.name} ·{" "}
                {a.donorProfile.pet.owner.phone}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
