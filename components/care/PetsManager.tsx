"use client";
import { useState, type FormEvent } from "react";
import { Species } from "@prisma/client";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { Link, useRouter } from "@/lib/navigation";
import { speciesLabels } from "@/lib/care/labels";
import {
  CareShell,
  Field,
  Feedback,
  buttonClass,
  fieldClass,
  panelClass,
  secondaryClass,
} from "./CareShell";

export function PetsManager() {
  const vi = useLocale() === "vi";
  const router = useRouter();
  const pets = api.pets.list.useQuery();
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const create = api.pets.create.useMutation({
    onSuccess: (pet) => {
      router.push(`/dashboard/pets/${pet.id}`);
      router.refresh();
    },
    onError: () =>
      setError(
        vi
          ? "Không thể thêm thú cưng. Kiểm tra thông tin và mã microchip có bị trùng không."
          : "Could not add pet. Check details and whether the microchip is already registered.",
      ),
  });
  const archive = api.pets.delete.useMutation({
    onSuccess: async () => {
      setConfirmId(null);
      await pets.refetch();
      router.refresh();
    },
    onError: (err) => setError(err.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    create.mutate({
      name: String(form.get("name")),
      species: form.get("species") as Species,
      breed: String(form.get("breed") || "") || undefined,
      dateOfBirth: form.get("birthday")
        ? new Date(`${form.get("birthday")}T00:00:00+07:00`)
        : undefined,
      weight: form.get("weight") ? Number(form.get("weight")) : undefined,
      microchipId: String(form.get("microchip") || "") || undefined,
      gender: form.get("gender") as "male" | "female" | "unknown",
      isNeutered: form.get("neutered") === "on",
    });
  }
  return (
    <CareShell
      title={vi ? "Thú cưng của bạn" : "Your pets"}
      description={
        vi
          ? "Tạo hồ sơ đầu tiên, theo dõi sức khỏe và đặt lịch khám cho thú cưng."
          : "Create a pet profile, follow their health and book appointments."
      }
    >
      <Feedback error={error ?? pets.error?.message} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Hồ sơ đã lưu" : "Saved profiles"}
          </h2>
          {pets.isLoading && (
            <p role="status" className="mt-4">
              {vi ? "Đang tải…" : "Loading…"}
            </p>
          )}
          {pets.isError && (
            <button
              className={secondaryClass}
              onClick={() => void pets.refetch()}
            >
              {vi ? "Thử lại" : "Retry"}
            </button>
          )}
          {pets.data?.length === 0 && (
            <p className="mt-4 text-sm">
              {vi
                ? "Bạn chưa có thú cưng. Điền biểu mẫu để bắt đầu."
                : "No pets yet. Complete the form to get started."}
            </p>
          )}
          <div className="mt-5 space-y-3">
            {pets.data?.map((pet) => (
              <article
                key={pet.id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <h3 className="text-lg font-semibold">{pet.name}</h3>
                <p className="mt-1 text-sm">
                  {speciesLabels[pet.species]?.[vi ? 0 : 1]}{" "}
                  {pet.breed ? `· ${pet.breed}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    className={buttonClass}
                    href={`/dashboard/pets/${pet.id}`}
                  >
                    {vi ? "Mở hộ chiếu" : "Open passport"}
                  </Link>
                  <button
                    className={secondaryClass}
                    disabled={archive.isPending}
                    onClick={() => setConfirmId(pet.id)}
                  >
                    {vi ? "Lưu trữ hồ sơ" : "Archive profile"}
                  </button>
                </div>
                {confirmId === pet.id && (
                  <div className="mt-3 text-sm">
                    <p>
                      {vi
                        ? "Hồ sơ sẽ ẩn khỏi danh sách; lịch sử vẫn được giữ. Xác nhận lưu trữ?"
                        : "Hide this pet from the list while keeping its history?"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        className={buttonClass}
                        disabled={archive.isPending}
                        onClick={() => archive.mutate({ petId: pet.id })}
                      >
                        {vi ? "Xác nhận" : "Confirm"}
                      </button>
                      <button
                        className={secondaryClass}
                        onClick={() => setConfirmId(null)}
                      >
                        {vi ? "Quay lại" : "Back"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">
            {vi ? "Thêm thú cưng" : "Add a pet"}
          </h2>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={vi ? "Tên *" : "Name *"}>
              <input
                name="name"
                required
                maxLength={50}
                className={fieldClass}
              />
            </Field>
            <Field label={vi ? "Loài *" : "Species *"}>
              <select name="species" className={fieldClass}>
                {Object.values(Species).map((value) => (
                  <option key={value} value={value}>
                    {speciesLabels[value]?.[vi ? 0 : 1]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={vi ? "Giống" : "Breed"}>
              <input name="breed" maxLength={100} className={fieldClass} />
            </Field>
            <Field label={vi ? "Ngày sinh" : "Date of birth"}>
              <input
                name="birthday"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={fieldClass}
              />
            </Field>
            <Field label={vi ? "Cân nặng (kg)" : "Weight (kg)"}>
              <input
                name="weight"
                type="number"
                min="0.001"
                max="1000"
                step="0.001"
                className={fieldClass}
              />
            </Field>
            <Field label={vi ? "Giới tính" : "Sex"}>
              <select name="gender" className={fieldClass}>
                <option value="unknown">{vi ? "Chưa rõ" : "Unknown"}</option>
                <option value="male">{vi ? "Đực" : "Male"}</option>
                <option value="female">{vi ? "Cái" : "Female"}</option>
              </select>
            </Field>
            <Field label="Microchip">
              <input name="microchip" maxLength={100} className={fieldClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input name="neutered" type="checkbox" />
              {vi ? "Đã triệt sản" : "Neutered"}
            </label>
            <button
              disabled={create.isPending}
              className={`${buttonClass} sm:col-span-2`}
            >
              {create.isPending
                ? vi
                  ? "Đang lưu…"
                  : "Saving…"
                : vi
                  ? "Tạo hồ sơ"
                  : "Create profile"}
            </button>
          </form>
        </section>
      </div>
    </CareShell>
  );
}
