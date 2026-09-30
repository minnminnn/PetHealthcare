import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  PrismaClient,
  Prisma,
  Species,
  AppointmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import nextEnv from "@next/env";
import { clinics, owners, demoPets, demoId, expectedCounts } from "./demo/data";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const args = new Set(process.argv.slice(2));
const prefix = "petcare-demo-";
const credentialsPath = new URL(
  "./demo/credentials.local.json",
  import.meta.url,
);

async function counts(db: PrismaClient) {
  const where = { id: { startsWith: prefix } };
  return {
    users: await db.user.count({ where }),
    clinics: await db.clinic.count({ where }),
    vets: await db.vet.count({ where }),
    pets: await db.pet.count({ where }),
    weightRecords: await db.weightRecord.count({ where }),
    medicalRecords: await db.medicalRecord.count({ where }),
    vaccinations: await db.vaccination.count({ where }),
    prescriptions: await db.prescription.count({ where }),
    appointments: await db.appointment.count({ where }),
    reminders: await db.reminder.count({ where }),
    notifications: await db.notification.count({ where }),
    bloodDonors: await db.bloodDonorProfile.count({ where }),
  };
}

async function syncDemoVetProfiles(db: PrismaClient) {
  await db.$transaction(
    clinics.flatMap((clinic) => [
      db.user.updateMany({
        where: { id: demoId("admin", clinic.key) },
        data: { name: clinic.vetName },
      }),
      db.vet.updateMany({
        where: { id: demoId("vet", clinic.key) },
        data: {
          yearsExperience: clinic.yearsExperience,
          bio: clinic.vetBio,
          specializations: clinic.specializations,
          isExoticSpec: clinic.isExoticSpec,
        },
      }),
    ]),
  );
}

async function verify(db: PrismaClient) {
  const actual = await counts(db);
  for (const name of Object.keys(
    expectedCounts,
  ) as (keyof typeof expectedCounts)[]) {
    if (actual[name] !== expectedCounts[name])
      throw new Error(`Unexpected demo count for ${name}: ${actual[name]}`);
  }
  const accounts = await db.user.findMany({
    where: { id: { startsWith: prefix } },
    select: {
      id: true,
      email: true,
      role: true,
      passwordHash: true,
      isActive: true,
    },
  });
  const identities = [
    ...owners.map((o) => ({
      id: demoId("owner", o.key),
      email: o.email,
      role: "OWNER",
    })),
    ...clinics.map((c) => ({
      id: demoId("admin", c.key),
      email: c.adminEmail,
      role: "CLINIC_ADMIN",
    })),
  ];
  for (const identity of identities) {
    const account = accounts.find((a) => a.id === identity.id);
    if (
      !account ||
      account.email !== identity.email ||
      account.role !== identity.role ||
      !account.isActive ||
      !account.passwordHash
    ) {
      throw new Error(`Invalid demo account ${identity.id}`);
    }
  }
  const storedVets = await db.vet.findMany({
    where: { id: { startsWith: prefix } },
    include: { user: { select: { name: true } } },
  });
  for (const clinic of clinics) {
    const vet = storedVets.find(
      (item) => item.id === demoId("vet", clinic.key),
    );
    if (
      !vet ||
      vet.user.name !== clinic.vetName ||
      vet.yearsExperience !== clinic.yearsExperience ||
      vet.bio !== clinic.vetBio
    ) {
      throw new Error(`Invalid demo vet profile ${clinic.key}`);
    }
  }
  if (existsSync(credentialsPath)) {
    const { password } = JSON.parse(readFileSync(credentialsPath, "utf8"));
    for (const hash of Array.from(
      new Set(accounts.map((a) => a.passwordHash!)),
    )) {
      if (!(await bcrypt.compare(password, hash)))
        throw new Error("A demo password differs from the local login guide");
    }
  }
  const storedPets = await db.pet.findMany({
    where: { id: { startsWith: prefix } },
    include: {
      appointments: true,
      medicalRecords: true,
      vaccinations: true,
      reminders: true,
      weightHistory: true,
      prescriptions: true,
    },
  });
  for (const owner of owners) {
    for (const pet of owner.pets) {
      const saved = storedPets.find((p) => p.id === demoId("pet", pet.key));
      if (
        !saved ||
        saved.ownerId !== demoId("owner", owner.key) ||
        saved.species !== pet.species ||
        saved.appointments.length < 3 ||
        saved.medicalRecords.length < 2 ||
        saved.weightHistory.length < 4 ||
        saved.prescriptions.length < 1 ||
        saved.reminders.length < 2 ||
        ((pet.species === Species.DOG || pet.species === Species.CAT) &&
          saved.vaccinations.length < 2) ||
        saved.appointments.some((a) => a.ownerId !== saved.ownerId) ||
        saved.reminders.some((r) => r.channel.some((c) => c !== "IN_APP"))
      ) {
        throw new Error(`Incomplete demo pet ${pet.key}`);
      }
    }
  }
  console.log(JSON.stringify({ verified: true, demo: actual }, null, 2));
}

async function seed(db: PrismaClient) {
  // Abort if a fixture collides with an existing account or clinic.
  const identities = [
    ...owners.map((o) => ({ id: demoId("owner", o.key), email: o.email })),
    ...clinics.map((c) => ({
      id: demoId("admin", c.key),
      email: c.adminEmail,
    })),
  ];
  const existingUsers = await db.user.findMany({
    where: {
      OR: [
        { email: { in: identities.map((i) => i.email) } },
        { id: { in: identities.map((i) => i.id) } },
      ],
    },
    select: { id: true, email: true },
  });
  for (const user of existingUsers) {
    if (!identities.some((i) => i.id === user.id && i.email === user.email))
      throw new Error("Demo account collision; no data was changed");
  }
  const existingClinics = await db.clinic.findMany({
    where: {
      OR: [
        { slug: { in: clinics.map((c) => c.slug) } },
        { id: { in: clinics.map((c) => demoId("clinic", c.key)) } },
      ],
    },
    select: { id: true, slug: true },
  });
  if (
    existingClinics.some(
      (c) =>
        !clinics.some(
          (f) => c.id === demoId("clinic", f.key) && c.slug === f.slug,
        ),
    )
  ) {
    throw new Error("Demo clinic collision; no data was changed");
  }

  let credentials: { password: string; createdAt: string };
  if (existsSync(credentialsPath)) {
    credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
    if (
      typeof credentials.password !== "string" ||
      credentials.password.length < 16 ||
      !Number.isFinite(Date.parse(credentials.createdAt))
    ) {
      throw new Error("Invalid local demo credentials file");
    }
  } else {
    if (existingUsers.length)
      throw new Error(
        "Demo users already exist, but the local password file is missing; existing passwords were preserved",
      );
    credentials = {
      password: `Demo@${randomBytes(15).toString("base64url")}`,
      createdAt: new Date().toISOString(),
    };
    writeFileSync(
      credentialsPath,
      JSON.stringify(credentials, null, 2) + "\n",
      { mode: 0o600, flag: "wx" },
    );
  }
  const passwordHash = await bcrypt.hash(credentials.password, 12);
  const existingCounts = await counts(db);
  await syncDemoVetProfiles(db);
  if (
    Object.entries(expectedCounts).every(
      ([key, count]) =>
        existingCounts[key as keyof typeof expectedCounts] === count,
    ) &&
    existsSync(new URL("../docs/demo-accounts.local.md", import.meta.url))
  ) {
    console.log(
      "Demo records already complete; skipping inserts and preserving existing data.",
    );
    return;
  }
  const base = new Date(credentials.createdAt);
  const date = (days: number) => new Date(base.getTime() + days * 86_400_000);
  const hours = (is24h: boolean) =>
    Object.fromEntries(
      ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => [
        day,
        {
          open: is24h ? "00:00" : "08:00",
          close: is24h ? "23:59" : "20:00",
          is24h,
        },
      ]),
    );
  for (const clinic of clinics) {
    await db.$transaction(
      async (tx) => {
        const adminId = demoId("admin", clinic.key);
        const clinicId = demoId("clinic", clinic.key);
        await tx.user.upsert({
          where: { id: adminId },
          update: { name: clinic.vetName },
          create: {
            id: adminId,
            email: clinic.adminEmail,
            name: clinic.vetName,
            role: "CLINIC_ADMIN",
            passwordHash,
            emailVerified: base,
            termsAcceptedAt: base,
            locale: "vi",
          },
        });
        await tx.clinic.upsert({
          where: { id: clinicId },
          update: {},
          create: {
            id: clinicId,
            adminUserId: adminId,
            name: clinic.name,
            slug: clinic.slug,
            nameUnaccented: clinic.name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D")
              .toLowerCase(),
            description:
              "DỮ LIỆU DEMO: Phòng khám hư cấu phục vụ kiểm thử đồ án. Địa chỉ, tọa độ và trạng thái chỉ để mô phỏng; không dùng để tìm nơi khám thật.",
            address: clinic.address,
            district: clinic.district,
            city: clinic.city,
            phone: "",
            email: clinic.adminEmail,
            imageUrls: [],
            latitude: clinic.latitude,
            longitude: clinic.longitude,
            status: clinic.status,
            // Simulate approved listings so the current discovery UI can be demonstrated.
            isVerified: true,
            is24h: clinic.is24h,
            isExoticSpec: clinic.isExoticSpec,
            specializations: clinic.specializations,
            openingHours: hours(clinic.is24h),
            rating: 0,
            reviewCount: 0,
          },
        });
        await tx.vet.upsert({
          where: { id: demoId("vet", clinic.key) },
          update: {
            yearsExperience: clinic.yearsExperience,
            bio: clinic.vetBio,
            specializations: clinic.specializations,
            isExoticSpec: clinic.isExoticSpec,
          },
          create: {
            id: demoId("vet", clinic.key),
            userId: adminId,
            clinicId,
            licenseNumber: `DEMO-NOT-A-LICENSE-${clinic.key}`,
            specializations: clinic.specializations,
            isExoticSpec: clinic.isExoticSpec,
            isVerified: true,
            bio: clinic.vetBio,
            yearsExperience: clinic.yearsExperience,
          },
        });
      },
      { timeout: 30_000 },
    );
  }
  console.log(`Demo clinics ready: ${clinics.length}`);

  for (const owner of owners) {
    const clinic = clinics.find((c) => c.key === owner.clinicKey)!;
    const ownerId = demoId("owner", owner.key);
    const clinicId = demoId("clinic", clinic.key);
    const vetId = demoId("vet", clinic.key);
    await db.$transaction(
      async (tx) => {
        await tx.user.upsert({
          where: { id: ownerId },
          update: {},
          create: {
            id: ownerId,
            email: owner.email,
            name: owner.name,
            role: "OWNER",
            passwordHash,
            emailVerified: base,
            termsAcceptedAt: base,
            locale: "vi",
          },
        });
        for (const pet of owner.pets) {
          const petId = demoId("pet", pet.key);
          const isDogCat =
            pet.species === Species.DOG || pet.species === Species.CAT;
          await tx.pet.upsert({
            where: { id: petId },
            update: {},
            create: {
              id: petId,
              ownerId,
              name: pet.name,
              species: pet.species,
              breed: pet.breed,
              color: pet.color,
              gender: pet.gender,
              weight: pet.weight,
              dateOfBirth: date(-pet.ageMonths * 30),
              passportNumber: `DEMO-PET-${pet.key}`,
              bloodType: "UNKNOWN",
              notes:
                "Hồ sơ thú cưng hư cấu phục vụ demo. Các mốc chăm sóc không phải hướng dẫn thú y.",
            },
          });
          for (let i = 0; i < 4; i++) {
            const id = demoId("weight", `${pet.key}-${i}`);
            await tx.weightRecord.upsert({
              where: { id },
              update: {},
              create: {
                id,
                petId,
                weight: Number((pet.weight * (0.94 + i * 0.02)).toFixed(3)),
                recordedAt: date(-90 + i * 30),
                recordedBy: owner.name,
                notes: "Số đo mô phỏng để minh họa biểu đồ cân nặng.",
              },
            });
          }
          for (let i = 0; i < 2; i++) {
            const id = demoId("record", `${pet.key}-${i}`);
            await tx.medicalRecord.upsert({
              where: { id },
              update: {},
              create: {
                id,
                petId,
                clinicId,
                vetId,
                type: i === 0 ? "PROGRESS_NOTE" : "LAB_RESULT",
                title:
                  i === 0
                    ? "[DEMO] Khám sức khỏe định kỳ"
                    : "[DEMO] Hồ sơ kiểm tra bổ sung",
                description:
                  "Dữ liệu giả lập phục vụ trình diễn lịch sử khám; không có kết quả chẩn đoán thật.",
                attachments: [],
                visitDate: date(-30 + i * 7),
              },
            });
          }
          if (isDogCat) {
            for (let i = 0; i < 2; i++) {
              const id = demoId("vaccine", `${pet.key}-${i}`);
              await tx.vaccination.upsert({
                where: { id },
                update: {},
                create: {
                  id,
                  petId,
                  vaccineName: `[DEMO] Hồ sơ tiêm chủng ${i + 1}`,
                  administeredAt: date(-120 + i * 30),
                  nextDueAt: date(14 + i * 14),
                  clinicName: clinic.name,
                  vetName: clinic.vetName,
                  notes:
                    "Mốc thời gian giả lập để thử giao diện; không phải lịch tiêm hoặc loại vắc-xin được khuyến nghị.",
                },
              });
            }
            const id = demoId("donor", pet.key);
            await tx.bloodDonorProfile.upsert({
              where: { id },
              update: {},
              create: {
                id,
                petId,
                bloodType: "UNKNOWN",
                status: "PENDING_REVIEW",
                ownerConsent: false,
                weight: pet.weight,
                isVaccinated: false,
                city: clinic.city,
                healthNotes:
                  "Hồ sơ demo chưa xác minh; không dùng để điều phối hiến máu.",
              },
            });
          }
          const prescriptionId = demoId("prescription", pet.key);
          await tx.prescription.upsert({
            where: { id: prescriptionId },
            update: {},
            create: {
              id: prescriptionId,
              petId,
              issuedBy: clinic.vetName,
              clinicName: clinic.name,
              issuedAt: date(-30),
              validUntil: date(-23),
              drugs: [
                {
                  name: "[DEMO] Mục thuốc minh họa",
                  dosage: "Không áp dụng",
                  frequency: "Không áp dụng",
                  duration: "Không áp dụng",
                  notes: "Không phải thuốc hoặc đơn điều trị thật.",
                },
              ],
              instructions:
                "Bản mẫu trình diễn hồ sơ đơn thuốc, không dùng điều trị.",
            },
          });
          const statuses: AppointmentStatus[] = [
            "COMPLETED",
            Number(pet.key) % 2 ? "CONFIRMED" : "PENDING",
            "CANCELLED",
          ];
          for (let i = 0; i < 3; i++) {
            const id = demoId("appointment", `${pet.key}-${i}`);
            const scheduledAt = date(
              i === 0 ? -30 : i === 1 ? Number(pet.key) % 7 : -7,
            );
            scheduledAt.setUTCHours(
              2 + (Number(pet.key) % 8),
              (Number(pet.key) % 2) * 30,
              0,
              0,
            );
            await tx.appointment.upsert({
              where: { id },
              update: {},
              create: {
                id,
                petId,
                ownerId,
                clinicId,
                vetId,
                status: statuses[i],
                type: i === 1 ? "FOLLOW_UP" : "IN_PERSON",
                scheduledAt,
                durationMinutes: 30,
                chiefComplaint: "[DEMO] Lịch kiểm tra sức khỏe",
                notes:
                  "Cuộc hẹn giả lập, không phải đặt lịch tại phòng khám thật.",
              },
            });
          }
          for (let i = 0; i < 2; i++) {
            const id = demoId("reminder", `${pet.key}-${i}`);
            await tx.reminder.upsert({
              where: { id },
              update: {},
              create: {
                id,
                petId,
                type: "HEALTH_CHECKUP",
                title: `[DEMO] Nhắc kiểm tra hồ sơ ${pet.name} ${i + 1}`,
                dueAt: date(3 + (Number(pet.key) % 7) + i * 7),
                channel: ["IN_APP"],
                isActive: true,
              },
            });
          }
        }
        const id = demoId("notification", owner.key);
        await tx.notification.upsert({
          where: { id },
          update: {},
          create: {
            id,
            userId: ownerId,
            title: "Chào mừng đến với tài khoản demo PetCare",
            body: "Bạn có 2 thú cưng với hồ sơ và lịch chăm sóc mô phỏng để trải nghiệm đồ án.",
            channel: "IN_APP",
            url: "/vi/dashboard/owner",
          },
        });
      },
      { timeout: 60_000 },
    );
    console.log(`Demo owner ${owner.key}: 2 pets ready`);
  }

  mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
  const guide = [
    "# Tài khoản demo PetCare",
    "",
    "Dữ liệu hư cấu, chỉ dùng trình diễn đồ án. Email .test không phải hộp thư nhận email.",
    "",
    `Mật khẩu chung: \`${credentials.password}\``,
    "",
    "Đăng nhập bằng email và mật khẩu trên trang /vi/login (không dùng Google).",
    "",
    "## 17 chủ nuôi",
    "",
    "| Email | Tên | Thú cưng |",
    "|---|---|---|",
    ...owners.map(
      (o) =>
        `| ${o.email} | ${o.name} | ${o.pets.map((p) => `${p.name} (${p.species})`).join(", ")} |`,
    ),
    "",
    "## Quản trị phòng khám / bác sĩ demo",
    "",
    "| Email | Phòng khám | Bác sĩ | Kinh nghiệm |",
    "|---|---|---|---|",
    ...clinics.map(
      (c) =>
        `| ${c.adminEmail} | ${c.name} | ${c.vetName} | ${c.yearsExperience} năm |`,
    ),
    "",
    "Các tài khoản phòng khám dùng cùng mật khẩu ở trên. Chúng có quyền CLINIC_ADMIN và hồ sơ bác sĩ gắn với phòng khám tương ứng.",
    "",
  ].join("\n");
  writeFileSync(
    new URL("../docs/demo-accounts.local.md", import.meta.url),
    guide,
    { mode: 0o600 },
  );
  console.log(
    "Login guide saved to docs/demo-accounts.local.md (excluded from Git)",
  );
}

async function main() {
  if (
    Array.from(args).some((a) => !["--apply", "--verify"].includes(a)) ||
    args.size > 1
  ) {
    throw new Error("Usage: npm run db:demo -- [--apply | --verify]");
  }
  console.log(
    JSON.stringify(
      {
        owners: owners.length,
        species: new Set(demoPets.map((p) => p.species)).size,
        expected: expectedCounts,
      },
      null,
      2,
    ),
  );
  if (!args.size) {
    console.log(
      "Validation complete. Use --apply to insert or --verify to check the database.",
    );
    return;
  }
  if (args.has("--apply") && process.env.NODE_ENV === "production")
    throw new Error("Demo import is disabled in production mode");
  const db = new PrismaClient({ log: [] });
  try {
    if (args.has("--apply")) await seed(db);
    await verify(db);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  // Prisma errors can include connection details; print only their type/code.
  console.error(
    error instanceof Prisma.PrismaClientKnownRequestError
      ? `Database error: ${error.code}`
      : error instanceof Prisma.PrismaClientInitializationError
        ? "Cannot connect to the database"
        : error instanceof Error
          ? error.message
          : "Demo import failed",
  );
  process.exitCode = 1;
});
