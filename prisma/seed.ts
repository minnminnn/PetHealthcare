/**
 * Seed Script — Pet Healthcare Platform
 *
 * Creates:
 *  1. System Admin
 *  2. Verified Clinic: "Phòng Khám Thú Y Quốc Tế Hà Nội" (PKTYQTHN)
 *  3. Clinic Vet: Dr. Trần Minh Khoa
 *  4. Pet Owner: Nguyễn Thị Lan
 *  5. British Longhair cat: "Kem" (2yo) — full medical passport
 *  6. Sample toxic substances & drug entries
 */

import { PrismaClient, Role, Species, BloodType, ClinicStatus, DonorStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ── Enable PostgreSQL Extensions ───────────────────────────────────────────
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`);
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "unaccent";`);
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "postgis";`);

  // ── PostGIS Spatial Index on clinics.location ──────────────────────────────
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS clinics_location_gist
    ON clinics USING GIST (location);
  `);

  // ── pg_trgm GIN Index on clinics.name_unaccented ──────────────────────────
  //await prisma.$executeRawUnsafe(`
    //CREATE INDEX IF NOT EXISTS clinics_name_trgm_idx
    //ON clinics USING GIN (name_unaccented gin_trgm_ops);
  //`);

  // ── pg_trgm GIN Index on pets.name ────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS pets_name_trgm_idx
    ON pets USING GIN (name gin_trgm_ops);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SYSTEM ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@PetCare2025!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@petcare.vn" },
    update: {},
    create: {
      email: "admin@petcare.vn",
      name: "PetCare Admin",
      passwordHash: adminPasswordHash,
      role: Role.SYSTEM_ADMIN,
      emailVerified: new Date(),
      locale: "vi",
    },
  });
  console.log(`✅ System Admin created: ${admin.email}`);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CLINIC ADMIN USER
  // ─────────────────────────────────────────────────────────────────────────
  const clinicAdminPasswordHash = await bcrypt.hash("Clinic@2025!", 12);
  const clinicAdmin = await prisma.user.upsert({
    where: { email: "pkqt.hanoi@petcare.vn" },
    update: {},
    create: {
      email: "pkqt.hanoi@petcare.vn",
      name: "BS. Trần Minh Khoa",
      passwordHash: clinicAdminPasswordHash,
      role: Role.CLINIC_ADMIN,
      emailVerified: new Date(),
      phone: "+84901234567",
      phoneVerified: true,
      locale: "vi",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. VERIFIED CLINIC
  // ─────────────────────────────────────────────────────────────────────────
  const clinic = await prisma.clinic.upsert({
    where: { slug: "phong-kham-thu-y-quoc-te-ha-noi" },
    update: {},
    create: {
      adminUserId: clinicAdmin.id,
      name: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      nameUnaccented: "phong kham thu y quoc te ha noi",
      slug: "phong-kham-thu-y-quoc-te-ha-noi",
      description:
        "Phòng khám thú y uy tín hàng đầu Hà Nội, chuyên điều trị thú cưng các loài (chó, mèo, thỏ, vẹt, bò sát). Đội ngũ bác sĩ 10+ năm kinh nghiệm. Trang thiết bị hiện đại: nội soi, siêu âm, X-quang kỹ thuật số.",
      address: "128 Phố Quan Hoa, Cầu Giấy",
      district: "Cầu Giấy",
      city: "Hà Nội",
      phone: "024 3786 5432",
      email: "contact@pkqt-hanoi.vn",
      website: "https://pkqt-hanoi.vn",
      status: ClinicStatus.EMERGENCY,
      isVerified: true,
      is24h: true,
      isExoticSpec: true,
      specializations: [Species.CAT, Species.DOG, Species.BIRD, Species.RABBIT, Species.REPTILE, Species.HAMSTER],
      latitude: 21.0285,
      longitude: 105.7968,
      rating: 4.9,
      reviewCount: 842,
      openingHours: {
        mon: { open: "00:00", close: "23:59", is24h: true },
        tue: { open: "00:00", close: "23:59", is24h: true },
        wed: { open: "00:00", close: "23:59", is24h: true },
        thu: { open: "00:00", close: "23:59", is24h: true },
        fri: { open: "00:00", close: "23:59", is24h: true },
        sat: { open: "00:00", close: "23:59", is24h: true },
        sun: { open: "00:00", close: "23:59", is24h: true },
      },
    },
  });

  // Update clinic with PostGIS spatial point
  await prisma.$executeRawUnsafe(`
    UPDATE clinics
    SET location = ST_SetSRID(ST_MakePoint(${clinic.longitude}, ${clinic.latitude}), 4326)
    WHERE id = '${clinic.id}';
  `);

  console.log(`✅ Clinic created: ${clinic.name}`);

  // ─────────────────────────────────────────────────────────────────────────
  // 4. VET PROFILE for clinic admin
  // ─────────────────────────────────────────────────────────────────────────
  const vet = await prisma.vet.upsert({
    where: { userId: clinicAdmin.id },
    update: {},
    create: {
      userId: clinicAdmin.id,
      licenseNumber: "VN-VET-2015-HN-4421",
      specializations: [Species.CAT, Species.DOG, Species.RABBIT, Species.BIRD],
      isExoticSpec: true,
      clinicId: clinic.id,
      bio: "Tiến sĩ Thú y, chuyên khoa nội khoa và ngoại khoa thú cưng. 12 năm kinh nghiệm điều trị mèo ngoại lai và thú cưng đặc biệt.",
      yearsExperience: 12,
      isVerified: true,
    },
  });
  console.log(`✅ Vet profile created: ${clinicAdmin.name}`);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. PET OWNER
  // ─────────────────────────────────────────────────────────────────────────
  const ownerPasswordHash = await bcrypt.hash("Owner@2025!", 12);
  const owner = await prisma.user.upsert({
    where: { email: "lan.nguyen@example.vn" },
    update: {},
    create: {
      email: "lan.nguyen@example.vn",
      name: "Nguyễn Thị Lan",
      passwordHash: ownerPasswordHash,
      role: Role.OWNER,
      emailVerified: new Date(),
      phone: "+84912345678",
      phoneVerified: true,
      locale: "vi",
    },
  });
  console.log(`✅ Pet Owner created: ${owner.name}`);

  // ─────────────────────────────────────────────────────────────────────────
  // 6. PET: "Kem" — British Longhair cat, 2 years old
  // ─────────────────────────────────────────────────────────────────────────
  const kemDOB = new Date("2024-03-15"); // ~2 years old

  const kem = await prisma.pet.upsert({
    where: { passportNumber: "PET-KEM-2024-VN-001" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Kem",
      species: Species.CAT,
      breed: "British Longhair",
      color: "Cream / Trắng kem",
      dateOfBirth: kemDOB,
      gender: "female",
      isNeutered: true,
      microchipId: "985141002345678",
      passportNumber: "PET-KEM-2024-VN-001",
      bloodType: BloodType.FELINE_A,
      weight: 4.2,
      notes: "Kem là mèo British Longhair thuần chủng, rất thân thiện và hiền lành. Đã triệt sản tháng 8/2024. Thức ăn ưa thích: Royal Canin Kitten 36.",
    },
  });
  console.log(`✅ Pet created: ${kem.name} (${kem.breed})`);

  // ── Weight History ─────────────────────────────────────────────────────────
  const weightHistory = [
    { weight: 0.35, recordedAt: new Date("2024-03-20"), recordedBy: "BS. Trần Minh Khoa" },
    { weight: 1.2,  recordedAt: new Date("2024-06-15"), recordedBy: "BS. Trần Minh Khoa" },
    { weight: 2.8,  recordedAt: new Date("2024-09-10"), recordedBy: "BS. Trần Minh Khoa" },
    { weight: 3.7,  recordedAt: new Date("2025-01-20"), recordedBy: "BS. Trần Minh Khoa" },
    { weight: 4.2,  recordedAt: new Date("2025-09-14"), recordedBy: "BS. Trần Minh Khoa" },
  ];

  for (const w of weightHistory) {
    await prisma.weightRecord.create({
      data: { petId: kem.id, ...w },
    });
  }
  console.log(`✅ Weight history: ${weightHistory.length} records`);

  // ── Vaccinations ───────────────────────────────────────────────────────────
  const vaccinations = [
    {
      vaccineName: "FVRCP (Panleukopenia, Calicivirus, Rhinotracheitis)",
      manufacturer: "Nobivac Tricat",
      batchNumber: "NBT2024-05-8821",
      administeredAt: new Date("2024-04-20"),
      nextDueAt: new Date("2025-04-20"),
      vetName: "BS. Trần Minh Khoa",
      clinicName: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      notes: "Mũi cơ bản lần 1 — 5 tuần tuổi",
    },
    {
      vaccineName: "FVRCP Booster",
      manufacturer: "Nobivac Tricat",
      batchNumber: "NBT2024-06-1234",
      administeredAt: new Date("2024-05-20"),
      nextDueAt: new Date("2025-05-20"),
      vetName: "BS. Trần Minh Khoa",
      clinicName: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      notes: "Mũi cơ bản lần 2 — 9 tuần tuổi",
    },
    {
      vaccineName: "Rabies (Dại)",
      manufacturer: "Rabisin",
      batchNumber: "RBS2024-07-5566",
      administeredAt: new Date("2024-06-20"),
      nextDueAt: new Date("2025-06-20"),
      vetName: "BS. Trần Minh Khoa",
      clinicName: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      notes: "Vắc-xin dại bắt buộc — 13 tuần tuổi",
    },
    {
      vaccineName: "FeLV (Feline Leukemia Virus)",
      manufacturer: "Purevax FeLV",
      batchNumber: "PFV2024-08-9901",
      administeredAt: new Date("2024-07-15"),
      nextDueAt: new Date("2025-07-15"),
      vetName: "BS. Trần Minh Khoa",
      clinicName: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      notes: "Phòng bạch cầu dòng lympho",
    },
    {
      vaccineName: "FVRCP Annual Booster",
      manufacturer: "Nobivac Tricat",
      batchNumber: "NBT2025-04-4422",
      administeredAt: new Date("2025-04-20"),
      nextDueAt: new Date("2026-04-20"),
      vetName: "BS. Trần Minh Khoa",
      clinicName: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      notes: "Nhắc lại hàng năm — đúng lịch",
    },
  ];

  for (const vax of vaccinations) {
    await prisma.vaccination.create({ data: { petId: kem.id, ...vax } });
  }
  console.log(`✅ Vaccinations: ${vaccinations.length} records`);

  // ── Medical Records ────────────────────────────────────────────────────────
  await prisma.medicalRecord.createMany({
    data: [
      {
        petId: kem.id,
        clinicId: clinic.id,
        vetId: vet.id,
        type: "VACCINATION",
        title: "Tiêm phòng cơ bản lần 1 (FVRCP)",
        description: "Kiểm tra sức khỏe tổng quát và tiêm phòng cơ bản lần đầu.",
        diagnosis: "Tình trạng sức khỏe tốt, không có dấu hiệu bệnh lý.",
        treatment: "Tiêm Nobivac Tricat. Theo dõi phản ứng 24h.",
        visitDate: new Date("2024-04-20"),
      },
      {
        petId: kem.id,
        clinicId: clinic.id,
        vetId: vet.id,
        type: "SURGERY",
        title: "Phẫu thuật triệt sản (Spay)",
        description: "Triệt sản mèo cái theo yêu cầu chủ nuôi để kiểm soát sinh sản.",
        diagnosis: "Sức khỏe tốt, phù hợp phẫu thuật.",
        treatment: "Phẫu thuật cắt buồng trứng và tử cung. Gây mê Isoflurane. Khâu tự tiêu. Thuốc giảm đau Meloxicam 0.05mg/kg trong 3 ngày.",
        visitDate: new Date("2024-08-10"),
      },
      {
        petId: kem.id,
        clinicId: clinic.id,
        vetId: vet.id,
        type: "DIAGNOSIS",
        title: "Khám định kỳ 6 tháng",
        description: "Kiểm tra sức khỏe định kỳ, đánh giá tình trạng sau triệt sản.",
        diagnosis: "Kem ở trạng thái sức khỏe tốt. Lông mịn, mắt sáng, tai sạch. Cân nặng đạt chuẩn 4.2kg.",
        treatment: "Bổ sung Omega-3 hỗ trợ lông và da. Tẩy giun định kỳ.",
        visitDate: new Date("2025-02-14"),
      },
      {
        petId: kem.id,
        clinicId: clinic.id,
        vetId: vet.id,
        type: "DENTAL",
        title: "Vệ sinh răng miệng",
        description: "Cao vôi răng giai đoạn nhẹ. Vệ sinh siêu âm.",
        diagnosis: "Cao vôi độ 1 ở răng hàm trên. Không có viêm nướu.",
        treatment: "Lấy vôi răng bằng máy siêu âm. Đánh bóng răng. Hướng dẫn chải răng tại nhà.",
        visitDate: new Date("2025-06-10"),
      },
    ],
  });
  console.log(`✅ Medical records: 4 records`);

  // ── Prescriptions ──────────────────────────────────────────────────────────
  await prisma.prescription.create({
    data: {
      petId: kem.id,
      issuedBy: "BS. Trần Minh Khoa",
      clinicName: "Phòng Khám Thú Y Quốc Tế Hà Nội",
      issuedAt: new Date("2024-08-10"),
      validUntil: new Date("2024-08-20"),
      drugs: [
        {
          name: "Meloxicam 1.5mg/ml (oral suspension)",
          dosage: "0.05mg/kg = ~0.2ml",
          frequency: "1 lần/ngày",
          duration: "3 ngày",
          notes: "Cho uống kèm thức ăn. Ngừng ngay nếu có nôn mửa.",
        },
        {
          name: "Amoxicillin-Clavulanate 50mg",
          dosage: "12.5mg/kg = ~½ viên",
          frequency: "2 lần/ngày",
          duration: "7 ngày",
          notes: "Kháng sinh phòng nhiễm trùng sau phẫu thuật.",
        },
      ],
      instructions:
        "Theo dõi vết mổ hàng ngày. Không để mèo liếm vết khâu. Đeo cổ vòng Elizabethan (cổ phễu) trong 10 ngày. Tái khám sau 10 ngày.",
    },
  });
  console.log(`✅ Prescription created`);

  // ── Reminders ──────────────────────────────────────────────────────────────
  await prisma.reminder.createMany({
    data: [
      {
        petId: kem.id,
        type: "VACCINATION",
        title: "Nhắc tiêm phòng FVRCP hàng năm",
        dueAt: new Date("2026-04-20"),
        repeatDays: 365,
        channel: ["EMAIL", "PUSH"],
        isActive: true,
      },
      {
        petId: kem.id,
        type: "DEWORMING",
        title: "Tẩy giun định kỳ 3 tháng",
        dueAt: new Date("2025-12-14"),
        repeatDays: 90,
        channel: ["EMAIL", "PUSH"],
        isActive: true,
      },
      {
        petId: kem.id,
        type: "FLEA_TICK_PREVENTION",
        title: "Nhỏ gáy phòng ve bọ chét",
        dueAt: new Date("2025-10-14"),
        repeatDays: 30,
        channel: ["PUSH"],
        isActive: true,
      },
      {
        petId: kem.id,
        type: "HEALTH_CHECKUP",
        title: "Khám sức khỏe định kỳ 6 tháng",
        dueAt: new Date("2026-02-14"),
        repeatDays: 180,
        channel: ["EMAIL"],
        isActive: true,
      },
    ],
  });
  console.log(`✅ Reminders: 4 created`);

  // ── Blood Donor Profile for Kem ───────────────────────────────────────────
  await prisma.bloodDonorProfile.upsert({
    where: { petId: kem.id },
    update: {},
    create: {
      petId: kem.id,
      bloodType: BloodType.FELINE_A,
      status: DonorStatus.ELIGIBLE,
      weight: 4.2,
      isVaccinated: true,
      ownerConsent: true,
      city: "Hà Nội",
      latitude: 21.0278,
      longitude: 105.8342,
      healthNotes: "Sức khỏe tốt, đã tiêm phòng đầy đủ, phù hợp hiến máu.",
    },
  });
  console.log(`✅ Blood donor profile: Kem registered`);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. TOXIC SUBSTANCES (Blacklist)
  // ─────────────────────────────────────────────────────────────────────────
  const toxicSubstances = [
    {
      name: "Paracetamol (Acetaminophen)",
      aliases: ["Tylenol", "Panadol", "Hapacol"],
      toxicFor: [Species.CAT, Species.DOG],
      severity: "lethal",
      symptoms: [
        "Methemoglobinemia",
        "Hoàng đản (vàng da)",
        "Phù mặt và chi trước",
        "Tiết nhiều nước bọt",
        "Khó thở",
        "Tụt huyết áp",
        "Hôn mê",
      ],
      firstAidSteps: [
        "Đưa ngay đến phòng khám cấp cứu thú y",
        "KHÔNG gây nôn nếu mèo đã hôn mê",
        "Giữ ấm và giữ yên tĩnh cho thú",
        "Thông báo cho bác sĩ về lượng thuốc và thời gian uống",
      ],
      antidote: "N-Acetylcysteine (NAC) — chỉ dùng tại phòng khám",
    },
    {
      name: "Permethrin",
      aliases: ["Advantix", "K9 Advantix", "Effitix"],
      toxicFor: [Species.CAT, Species.RABBIT],
      severity: "lethal",
      symptoms: [
        "Run rẩy (tremor) toàn thân",
        "Co giật",
        "Tăng tiết nước bọt",
        "Mất thăng bằng, ngã",
        "Đồng tử giãn",
        "Nhiệt độ cơ thể tăng cao",
      ],
      firstAidSteps: [
        "Rửa ngay bằng nước và xà phòng nhẹ — rửa nhiều lần",
        "Đưa đến phòng khám cấp cứu NGAY LẬP TỨC",
        "Giữ mát cho thú — không để tiếp xúc nhiệt độ cao",
        "Gọi cho bác sĩ thú y ngay",
      ],
      antidote: "Methocarbamol (kiểm soát co giật) — chỉ dùng tại phòng khám",
    },
    {
      name: "Ibuprofen",
      aliases: ["Advil", "Motrin", "Nurofen", "Brufen"],
      toxicFor: [Species.CAT, Species.DOG, Species.RABBIT],
      severity: "severe",
      symptoms: [
        "Nôn mửa (có thể ra máu)",
        "Tiêu chảy",
        "Loét dạ dày",
        "Suy thận cấp",
        "Co giật",
        "Hôn mê",
      ],
      firstAidSteps: [
        "Đưa ngay đến phòng khám thú y",
        "Giữ bằng chứng (tên thuốc, liều lượng)",
        "Không tự gây nôn tại nhà",
      ],
      antidote: "Không có antidote đặc hiệu — điều trị hỗ trợ tại phòng khám",
    },
    {
      name: "Xylitol",
      aliases: ["Birch Sugar", "Chất làm ngọt tự nhiên", "E967"],
      toxicFor: [Species.DOG, Species.CAT, Species.RABBIT, Species.HAMSTER],
      severity: "lethal",
      symptoms: [
        "Hạ đường huyết đột ngột",
        "Nôn mửa",
        "Mất thăng bằng, đi loạng choạng",
        "Co giật",
        "Suy gan cấp",
        "Hôn mê",
      ],
      firstAidSteps: [
        "Đưa ngay đến phòng khám thú y khẩn cấp",
        "Giữ bằng chứng (bao bì thực phẩm chứa xylitol)",
        "Không gây nôn trừ khi bác sĩ hướng dẫn",
      ],
      antidote: "Truyền glucose IV — chỉ dùng tại phòng khám",
    },
    {
      name: "Nho & Nho khô (Grape & Raisin)",
      aliases: ["Grapes", "Raisins", "Nho tươi", "Nho khô"],
      toxicFor: [Species.DOG, Species.CAT],
      severity: "severe",
      symptoms: [
        "Nôn mửa trong vòng 6 giờ",
        "Tiêu chảy",
        "Mệt mỏi, uể oải",
        "Chán ăn",
        "Đau bụng",
        "Thiểu niệu / vô niệu (suy thận)",
      ],
      firstAidSteps: [
        "Gây nôn trong vòng 2 giờ nếu thú vẫn tỉnh táo (chỉ với chó): dùng H2O2 3% theo hướng dẫn bác sĩ",
        "Đưa đến phòng khám thú y ngay lập tức",
        "Không tự điều trị tại nhà",
      ],
      antidote: "Không có antidote — rửa dạ dày và truyền dịch hỗ trợ",
    },
  ];

  for (const substance of toxicSubstances) {
    await prisma.toxicSubstance.upsert({
      where: { id: `toxic-${substance.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `toxic-${substance.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...substance,
        references: [
          "ASPCA Animal Poison Control Center",
          "Merck Veterinary Manual",
          "BSAVA Small Animal Formulary",
        ],
      },
    });
  }
  console.log(`✅ Toxic substances: ${toxicSubstances.length} entries`);

  // ─────────────────────────────────────────────────────────────────────────
  // 8. SAMPLE APPOINTMENT
  // ─────────────────────────────────────────────────────────────────────────
  await prisma.appointment.create({
    data: {
      petId: kem.id,
      ownerId: owner.id,
      clinicId: clinic.id,
      vetId: vet.id,
      type: "IN_PERSON",
      status: "CONFIRMED",
      scheduledAt: new Date("2025-09-20T09:30:00.000Z"),
      durationMinutes: 30,
      chiefComplaint: "Khám sức khỏe định kỳ, kiểm tra cân nặng và tiêm phòng nhắc lại",
      notes: "Kem đang ăn uống bình thường, không có triệu chứng bất thường.",
    },
  });
  console.log(`✅ Sample appointment created`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("─────────────────────────────────────────");
  console.log("👤 Admin:       admin@petcare.vn / Admin@PetCare2025!");
  console.log("🏥 Clinic Admin: pkqt.hanoi@petcare.vn / Clinic@2025!");
  console.log("👩 Pet Owner:   lan.nguyen@example.vn / Owner@2025!");
  console.log("🐱 Pet:        Kem (British Longhair) — PET-KEM-2024-VN-001");
  console.log("─────────────────────────────────────────");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
