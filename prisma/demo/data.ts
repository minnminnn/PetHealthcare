import { ClinicStatus, Species } from "@prisma/client";
import { z } from "zod";
import clinicData from "./clinics.json";
import ownerData from "./owners.json";

const key = z.string().regex(/^\d{2}$/);
const email = z.string().email().endsWith("@petcare-demo.test");
export const clinics = z
  .array(
    z.object({
      key,
      name: z.string().startsWith("[DEMO] "),
      slug: z.string().startsWith("demo-petcare-"),
      city: z.string().min(1),
      district: z.string().min(1),
      address: z.string().min(1),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      specializations: z.array(z.nativeEnum(Species)).nonempty(),
      is24h: z.boolean(),
      isExoticSpec: z.boolean(),
      status: z.nativeEnum(ClinicStatus),
      adminEmail: email,
      vetName: z.string().startsWith("[DEMO] "),
    }),
  )
  .nonempty()
  .parse(clinicData);

export const owners = z
  .array(
    z.object({
      key,
      name: z.string().startsWith("[DEMO] "),
      email,
      clinicKey: key,
      pets: z
        .array(
          z.object({
            key,
            name: z.string().min(1),
            species: z.nativeEnum(Species),
            breed: z.string().min(1),
            weight: z.number().positive(),
            color: z.string().min(1),
            gender: z.enum(["male", "female"]),
            ageMonths: z.number().int().min(12),
          }),
        )
        .nonempty(),
    }),
  )
  .nonempty()
  .parse(ownerData);

function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length)
    throw new Error(`Duplicate ${label} in demo fixtures`);
}
unique(
  clinics.map((c) => c.key),
  "clinic key",
);
unique(
  clinics.map((c) => c.slug),
  "clinic slug",
);
unique(
  owners.map((o) => o.key),
  "owner key",
);
unique(
  [...clinics.map((c) => c.adminEmail), ...owners.map((o) => o.email)],
  "email",
);
unique(
  owners.flatMap((o) => o.pets.map((p) => p.key)),
  "pet key",
);
for (const owner of owners) {
  const clinic = clinics.find((c) => c.key === owner.clinicKey);
  if (
    !clinic ||
    owner.pets.some((p) => !clinic.specializations.includes(p.species))
  ) {
    throw new Error(`Owner ${owner.key} has an invalid clinic assignment`);
  }
}

export const demoId = (kind: string, key: string) =>
  `petcare-demo-${kind}-${key}`;
export const demoPets = owners.flatMap((owner) => owner.pets);
export const vaccinatedPets = demoPets.filter(
  (p) => p.species === Species.DOG || p.species === Species.CAT,
);
export const expectedCounts = {
  users: owners.length + clinics.length,
  clinics: clinics.length,
  vets: clinics.length,
  pets: demoPets.length,
  weightRecords: demoPets.length * 4,
  medicalRecords: demoPets.length * 2,
  vaccinations: vaccinatedPets.length * 2,
  prescriptions: demoPets.length,
  appointments: demoPets.length * 3,
  reminders: demoPets.length * 2,
  notifications: owners.length,
  bloodDonors: vaccinatedPets.length,
};
