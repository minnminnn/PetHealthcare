import { ClinicStatus, Species } from "@prisma/client";
import { z } from "zod";
import clinicData from "./clinics.json";
import ownerData from "./owners.json";

const key = z.string().regex(/^\d{2}$/);
const email = z.string().email().endsWith("@petcare-demo.test");
const clinicFixtures = z
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

const vetProfiles: Record<
  string,
  { vetName: string; yearsExperience: number; vetBio: string }
> = {
  "01": {
    vetName: "BS. Thú y Nguyễn Minh Anh",
    yearsExperience: 11,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "02": {
    vetName: "BS. Thú y Trần Gia Hân",
    yearsExperience: 7,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "03": {
    vetName: "BS. Thú y Lê Hoàng Nam",
    yearsExperience: 9,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "04": {
    vetName: "BS. Thú y Phạm Khánh Linh",
    yearsExperience: 13,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "05": {
    vetName: "BS. Thú y Võ Tuấn Kiệt",
    yearsExperience: 6,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "06": {
    vetName: "BS. Thú y Đặng Ngọc Mai",
    yearsExperience: 8,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "07": {
    vetName: "BS. Thú y Bùi Đức Huy",
    yearsExperience: 12,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "08": {
    vetName: "BS. Thú y Nguyễn Thảo Vy",
    yearsExperience: 5,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "09": {
    vetName: "BS. Thú y Trần Quang Phúc",
    yearsExperience: 10,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "10": {
    vetName: "BS. Thú y Lê Hải Yến",
    yearsExperience: 14,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "11": {
    vetName: "BS. Thú y Phạm Quốc Bảo",
    yearsExperience: 7,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "12": {
    vetName: "BS. Thú y Vũ Thanh Trúc",
    yearsExperience: 9,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "13": {
    vetName: "BS. Thú y Nguyễn Nhật Minh",
    yearsExperience: 11,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "14": {
    vetName: "BS. Thú y Trần Bảo Ngọc",
    yearsExperience: 6,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "15": {
    vetName: "BS. Thú y Lâm Hoàng Long",
    yearsExperience: 8,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "16": {
    vetName: "BS. Thú y Phan Thu Hà",
    yearsExperience: 15,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "17": {
    vetName: "BS. Thú y Đỗ Minh Quân",
    yearsExperience: 9,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "18": {
    vetName: "BS. Thú y Nguyễn Tú Anh",
    yearsExperience: 7,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "19": {
    vetName: "BS. Thú y Trương Gia Bảo",
    yearsExperience: 12,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "20": {
    vetName: "BS. Thú y Lê Mỹ Duyên",
    yearsExperience: 5,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "21": {
    vetName: "BS. Thú y Huỳnh Anh Khoa",
    yearsExperience: 10,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
  "22": {
    vetName: "BS. Thú y Nguyễn Hoài An",
    yearsExperience: 13,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Kinh nghiệm khám nội khoa, cấp cứu và chăm sóc chó, mèo cùng thú ngoại lai.",
  },
  "23": {
    vetName: "BS. Thú y Đặng Khánh Chi",
    yearsExperience: 8,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Chuyên chăm sóc chim, thỏ, bò sát và các thú cưng nhỏ, thú ngoại lai.",
  },
  "24": {
    vetName: "BS. Thú y Phạm Minh Đức",
    yearsExperience: 6,
    vetBio:
      "Hồ sơ hư cấu phục vụ demo. Tập trung nội khoa, chăm sóc dự phòng và quản lý bệnh mạn tính ở chó, mèo và thỏ.",
  },
};

export const clinics = clinicFixtures.map((clinic) => {
  const profile = vetProfiles[clinic.key];
  if (!profile) throw new Error(`Missing demo vet profile ${clinic.key}`);
  return { ...clinic, ...profile };
});

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
  clinics.map((c) => c.vetName),
  "vet name",
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
