export type ClinicRecord = {
  id?: string | number;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  [key: string]: unknown;
};
export type ClinicReference = {
  name: string;
  address: string;
  phone: string | null;
};

export function normalizePhone(phone?: string | null): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("0084")) return `0${digits.slice(4)}`;
  if (digits.startsWith("84") && [11, 12].includes(digits.length))
    return `0${digits.slice(2)}`;
  return digits;
}
export function normalizeAddress(address?: string | null): string {
  return (address ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/\b(so|duong|pho|phuong|quan)\b/g, " ")
    .replace(/[.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function matchClinicNames(
  records: ClinicRecord[],
  reference: ClinicReference[],
) {
  const report: {
    index: number;
    id: string | number | undefined;
    status: "updated" | "preserved" | "unmatched" | "review";
    candidates: string[];
  }[] = [];
  const updated = records.map((record, index) => {
    const entry = {
      index,
      id: record.id,
      status: "unmatched" as "updated" | "preserved" | "unmatched" | "review",
      candidates: [] as string[],
    };
    report.push(entry);
    if (typeof record.name === "string" && record.name.trim()) {
      entry.status = "preserved";
      return { ...record };
    }
    const phone = normalizePhone(record.phone),
      address = normalizeAddress(record.address);
    const candidates = reference.filter(
      (r) =>
        (phone && normalizePhone(r.phone) === phone) ||
        (address && normalizeAddress(r.address) === address),
    );
    entry.candidates = candidates.map((r) => r.name);
    // Only an unambiguous match on both supplied fields is automatically applied.
    // Address-only matches (including VetFamily), shared numbers and contradictions are reviewed.
    if (
      candidates.length === 1 &&
      phone &&
      address &&
      normalizePhone(candidates[0]!.phone) === phone &&
      normalizeAddress(candidates[0]!.address) === address
    ) {
      entry.status = "updated";
      return { ...record, name: candidates[0]!.name };
    }
    if (candidates.length) entry.status = "review";
    return { ...record };
  });
  return { updated, report };
}
