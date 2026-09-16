"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Scale,
  Stethoscope,
  Syringe,
  Pill,
  X,
  Trash2,
  Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import type { PetAccessPermissions } from "@/server/authz/pet-access";
import { api } from "@/trpc/react";

type ActionKind =
  "profile" | "weight" | "record" | "vaccination" | "prescription";

const recordTypes = [
  "DIAGNOSIS",
  "SURGERY",
  "DENTAL",
  "DEWORMING",
  "LAB_RESULT",
  "IMAGING",
  "PROGRESS_NOTE",
  "DISCHARGE_SUMMARY",
] as const;

type DrugRow = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
};

const emptyDrug = (): DrugRow => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  notes: "",
});

function parseDate(value: FormDataEntryValue | null, required = false) {
  const text = String(value ?? "").trim();
  if (!text && !required) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("date");
  const date = new Date(`${text}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error("date");
  return date;
}

export function PassportActions({
  petId,
  petName,
  profile,
  permissions,
}: {
  petId: string;
  petName: string;
  profile: {
    breed: string | null;
    color: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    isNeutered: boolean;
    microchipId: string | null;
    notes: string | null;
  };
  permissions: PetAccessPermissions;
}) {
  const t = useTranslations("petPassport.actions");
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ActionKind>("weight");
  const [recordType, setRecordType] =
    useState<(typeof recordTypes)[number]>("PROGRESS_NOTE");
  const [drugs, setDrugs] = useState<DrugRow[]>([emptyDrug()]);

  const closeAfterSuccess = async (message: string) => {
    await utils.pets.passport.invalidate({ petId });
    toast.success(message);
    setOpen(false);
  };

  const addWeight = api.pets.addWeight.useMutation({
    onSuccess: () => void closeAfterSuccess(t("success.weight")),
    onError: () => toast.error(t("error")),
  });
  const updateProfile = api.pets.update.useMutation({
    onSuccess: () => void closeAfterSuccess(t("success.profile")),
    onError: () => toast.error(t("error")),
  });
  const createRecord = api.medical.createRecord.useMutation({
    onSuccess: () => void closeAfterSuccess(t("success.record")),
    onError: () => toast.error(t("error")),
  });
  const addVaccination = api.medical.addVaccination.useMutation({
    onSuccess: () => void closeAfterSuccess(t("success.vaccination")),
    onError: () => toast.error(t("error")),
  });
  const addPrescription = api.medical.createPrescription.useMutation({
    onSuccess: () => void closeAfterSuccess(t("success.prescription")),
    onError: () => toast.error(t("error")),
  });

  const isPending =
    updateProfile.isPending ||
    addWeight.isPending ||
    createRecord.isPending ||
    addVaccination.isPending ||
    addPrescription.isPending;

  const launch = (nextKind: ActionKind) => {
    setKind(nextKind);
    setOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      if (kind === "profile") {
        const name = String(form.get("name") ?? "").trim();
        if (!name) return toast.error(t("validation.required"));
        const gender = String(form.get("gender") ?? "");
        updateProfile.mutate({
          petId,
          data: {
            name,
            breed: String(form.get("breed") ?? "").trim() || undefined,
            color: String(form.get("color") ?? "").trim() || undefined,
            dateOfBirth: parseDate(form.get("dateOfBirth")),
            gender:
              gender === "male" || gender === "female" || gender === "unknown"
                ? gender
                : undefined,
            isNeutered: form.get("isNeutered") === "on",
            microchipId:
              String(form.get("microchipId") ?? "").trim() || undefined,
            notes: String(form.get("profileNotes") ?? "").trim() || undefined,
          },
        });
      }

      if (kind === "weight") {
        const weight = Number(form.get("weight"));
        if (!Number.isFinite(weight) || weight <= 0)
          return toast.error(t("validation.weight"));
        addWeight.mutate({
          petId,
          weight,
          notes: String(form.get("notes") ?? "").trim() || undefined,
        });
      }

      if (kind === "record") {
        const title = String(form.get("title") ?? "").trim();
        if (!title) return toast.error(t("validation.required"));
        createRecord.mutate({
          petId,
          type: recordType,
          title,
          description:
            String(form.get("description") ?? "").trim() || undefined,
          diagnosis: String(form.get("diagnosis") ?? "").trim() || undefined,
          treatment: String(form.get("treatment") ?? "").trim() || undefined,
          attachments: String(form.get("attachments") ?? "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          isPrivate: form.get("isPrivate") === "on",
          visitDate: parseDate(form.get("visitDate"), true)!,
        });
      }

      if (kind === "vaccination") {
        const vaccineName = String(form.get("vaccineName") ?? "").trim();
        if (!vaccineName) return toast.error(t("validation.required"));
        addVaccination.mutate({
          petId,
          vaccineName,
          manufacturer:
            String(form.get("manufacturer") ?? "").trim() || undefined,
          batchNumber:
            String(form.get("batchNumber") ?? "").trim() || undefined,
          administeredAt: parseDate(form.get("administeredAt"), true)!,
          nextDueAt: parseDate(form.get("nextDueAt")),
          notes: String(form.get("notes") ?? "").trim() || undefined,
        });
      }

      if (kind === "prescription") {
        const validDrugs = drugs.map((drug) => ({
          name: drug.name.trim(),
          dosage: drug.dosage.trim(),
          frequency: drug.frequency.trim(),
          duration: drug.duration.trim(),
          notes: drug.notes.trim() || undefined,
        }));
        if (
          validDrugs.some(
            (drug) =>
              !drug.name || !drug.dosage || !drug.frequency || !drug.duration,
          )
        ) {
          return toast.error(t("validation.drug"));
        }
        addPrescription.mutate({
          petId,
          drugs: validDrugs,
          instructions:
            String(form.get("instructions") ?? "").trim() || undefined,
          validUntil: parseDate(form.get("validUntil")),
          refills: Math.max(0, Number(form.get("refills")) || 0),
        });
      }
    } catch {
      toast.error(t("validation.date"));
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 print:hidden">
        {permissions.canEditProfile && (
          <ActionButton
            icon={Pencil}
            label={t("profile.button")}
            onClick={() => launch("profile")}
          />
        )}
        {permissions.canAddWeight && (
          <ActionButton
            icon={Scale}
            label={t("weight.button")}
            onClick={() => launch("weight")}
          />
        )}
        {permissions.canWriteMedicalRecords && (
          <>
            <ActionButton
              icon={Stethoscope}
              label={t("record.button")}
              onClick={() => launch("record")}
              primary
            />
            <ActionButton
              icon={Syringe}
              label={t("vaccination.button")}
              onClick={() => launch("vaccination")}
            />
            <ActionButton
              icon={Pill}
              label={t("prescription.button")}
              onClick={() => launch("prescription")}
            />
          </>
        )}
      </div>

      <Dialog.Root
        open={open}
        onOpenChange={(next) => !isPending && setOpen(next)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[120] bg-secondary-950/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
          <Dialog.Content className="passport-dialog fixed left-1/2 top-1/2 z-[121] max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-black/10 bg-[#f8f8f5] p-5 shadow-2xl outline-none sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-2xl font-semibold tracking-[-0.03em] text-secondary-900">
                  {t(`${kind}.title`)}
                </Dialog.Title>
                <Dialog.Description className="mt-1.5 text-sm leading-6 text-secondary-600">
                  {t("forPet", { name: petName })}
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="rounded-lg p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900"
                aria-label={t("close")}
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <form className="mt-6 space-y-5" onSubmit={submit}>
              {kind === "profile" && (
                <ProfileForm t={t} petName={petName} profile={profile} />
              )}
              {kind === "weight" && <WeightForm t={t} />}
              {kind === "record" && (
                <RecordForm
                  t={t}
                  recordType={recordType}
                  setRecordType={setRecordType}
                />
              )}
              {kind === "vaccination" && <VaccinationForm t={t} />}
              {kind === "prescription" && (
                <PrescriptionForm t={t} drugs={drugs} setDrugs={setDrugs} />
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                <Dialog.Close
                  type="button"
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-secondary-700 hover:bg-secondary-100"
                >
                  {t("cancel")}
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary-700 disabled:cursor-wait disabled:opacity-55"
                >
                  <Plus className="h-4 w-4" />
                  {isPending ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: typeof Scale;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors ${primary ? "bg-secondary-900 text-white hover:bg-secondary-700" : "border border-black/10 bg-[#f8f8f5] text-secondary-800 hover:bg-white"}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ProfileForm({
  t,
  petName,
  profile,
}: {
  t: any;
  petName: string;
  profile: {
    breed: string | null;
    color: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    isNeutered: boolean;
    microchipId: string | null;
    notes: string | null;
  };
}) {
  const birthDate = profile.dateOfBirth
    ? profile.dateOfBirth.toISOString().slice(0, 10)
    : "";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="text-xs font-semibold text-secondary-700">
          {t("profile.name")}
          <span className="ml-0.5 text-primary-600">*</span>
        </span>
        <input
          name="name"
          required
          defaultValue={petName}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-secondary-700">
          {t("profile.gender")}
        </span>
        <div className="mt-1.5 flex rounded-xl border border-black/10 bg-secondary-100 p-1">
          {["male", "female", "unknown"].map((gender) => (
            <label key={gender} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={gender}
                defaultChecked={profile.gender === gender}
                className="peer sr-only"
              />
              <span className="block rounded-lg px-2 py-2 text-center text-xs font-semibold text-secondary-500 peer-checked:bg-secondary-900 peer-checked:text-white">
                {t(`profile.genders.${gender}`)}
              </span>
            </label>
          ))}
        </div>
      </label>
      <Field
        label={t("profile.breed")}
        name="breed"
        defaultValue={profile.breed ?? undefined}
      />
      <Field
        label={t("profile.color")}
        name="color"
        defaultValue={profile.color ?? undefined}
      />
      <label className="block">
        <span className="text-xs font-semibold text-secondary-700">
          {t("profile.birthDate")}
        </span>
        <input
          name="dateOfBirth"
          defaultValue={birthDate}
          placeholder="YYYY-MM-DD"
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
      </label>
      <Field
        label={t("profile.microchip")}
        name="microchipId"
        defaultValue={profile.microchipId ?? undefined}
      />
      <label className="flex items-center gap-2 self-end rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm font-medium text-secondary-700">
        <input
          type="checkbox"
          name="isNeutered"
          defaultChecked={profile.isNeutered}
          className="h-4 w-4 accent-primary-600"
        />
        {t("profile.neutered")}
      </label>
      <div className="sm:col-span-2">
        <label className="block">
          <span className="text-xs font-semibold text-secondary-700">
            {t("notes")}
          </span>
          <textarea
            name="profileNotes"
            defaultValue={profile.notes ?? ""}
            rows={3}
            className="mt-1.5 w-full resize-y rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm leading-6 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </label>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  required = false,
  type = "text",
  min,
  step,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-secondary-700">
        {label}
        {required && <span className="ml-0.5 text-primary-600">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm text-secondary-900 outline-none placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-secondary-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-y rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm leading-6 text-secondary-900 outline-none placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />
    </label>
  );
}

function WeightForm({ t }: { t: any }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label={t("weight.value")}
        name="weight"
        type="number"
        min="0.1"
        step="0.1"
        required
      />
      <div className="sm:col-span-2">
        <TextArea label={t("notes")} name="notes" />
      </div>
    </div>
  );
}

function RecordForm({
  t,
  recordType,
  setRecordType,
}: {
  t: any;
  recordType: (typeof recordTypes)[number];
  setRecordType: (value: (typeof recordTypes)[number]) => void;
}) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold text-secondary-700">
          {t("record.type")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recordTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRecordType(type)}
              aria-pressed={recordType === type}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${recordType === type ? "bg-secondary-900 text-white" : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"}`}
            >
              {t(`record.types.${type}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={t("record.name")} name="title" required />
        </div>
        <div className="sm:col-span-2">
          <TextArea label={t("record.description")} name="description" />
        </div>
        <TextArea label={t("record.diagnosis")} name="diagnosis" />
        <TextArea label={t("record.treatment")} name="treatment" />
        <Field
          label={t("visitDate")}
          name="visitDate"
          placeholder="YYYY-MM-DD"
          required
        />
        <label className="flex items-center gap-2 self-end rounded-xl border border-black/10 bg-secondary-100 px-3.5 py-2.5 text-sm font-medium text-secondary-700">
          <input
            type="checkbox"
            name="isPrivate"
            className="h-4 w-4 accent-primary-600"
          />
          {t("record.private")}
        </label>
        <div className="sm:col-span-2">
          <TextArea
            label={t("record.attachments")}
            name="attachments"
            placeholder={t("record.attachmentsHint")}
          />
        </div>
      </div>
    </>
  );
}

function VaccinationForm({ t }: { t: any }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label={t("vaccination.name")} name="vaccineName" required />
      </div>
      <Field label={t("vaccination.manufacturer")} name="manufacturer" />
      <Field label={t("vaccination.batch")} name="batchNumber" />
      <Field
        label={t("vaccination.administeredAt")}
        name="administeredAt"
        placeholder="YYYY-MM-DD"
        required
      />
      <Field
        label={t("vaccination.nextDueAt")}
        name="nextDueAt"
        placeholder="YYYY-MM-DD"
      />
      <div className="sm:col-span-2">
        <TextArea label={t("notes")} name="notes" />
      </div>
    </div>
  );
}

function PrescriptionForm({
  t,
  drugs,
  setDrugs,
}: {
  t: any;
  drugs: DrugRow[];
  setDrugs: (drugs: DrugRow[]) => void;
}) {
  const updateDrug = (index: number, field: keyof DrugRow, value: string) =>
    setDrugs(
      drugs.map((drug, drugIndex) =>
        drugIndex === index ? { ...drug, [field]: value } : drug,
      ),
    );
  return (
    <>
      <div className="space-y-3">
        {drugs.map((drug, index) => (
          <div
            key={index}
            className="rounded-2xl border border-black/10 bg-secondary-100 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary-500">
                {t("prescription.drug", { number: index + 1 })}
              </p>
              {drugs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setDrugs(
                      drugs.filter((_, drugIndex) => drugIndex !== index),
                    )
                  }
                  className="rounded-lg p-1.5 text-secondary-400 hover:bg-red-100 hover:text-red-700"
                  aria-label={t("prescription.removeDrug")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["name", "dosage", "frequency", "duration"] as const).map(
                (field) => (
                  <label key={field} className="block">
                    <span className="text-xs font-semibold text-secondary-600">
                      {t(`prescription.${field}`)}
                    </span>
                    <input
                      value={drug[field]}
                      onChange={(event) =>
                        updateDrug(index, field, event.target.value)
                      }
                      className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#f8f8f5] px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                  </label>
                ),
              )}
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-secondary-600">
                  {t("notes")}
                </span>
                <input
                  value={drug.notes}
                  onChange={(event) =>
                    updateDrug(index, "notes", event.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#f8f8f5] px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setDrugs([...drugs, emptyDrug()])}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-900"
      >
        <Plus className="h-4 w-4" />
        {t("prescription.addDrug")}
      </button>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("prescription.validUntil")}
          name="validUntil"
          placeholder="YYYY-MM-DD"
        />
        <Field
          label={t("prescription.refills")}
          name="refills"
          type="number"
          min="0"
          step="1"
        />
        <div className="sm:col-span-2">
          <TextArea
            label={t("prescription.instructions")}
            name="instructions"
          />
        </div>
      </div>
    </>
  );
}
