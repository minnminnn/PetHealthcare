-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'VET', 'CLINIC_ADMIN', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'REPTILE', 'FISH', 'FERRET', 'GUINEA_PIG', 'OTHER');

-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('AVAILABLE', 'BUSY', 'EMERGENCY', 'CLOSED');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('DEA1_POSITIVE', 'DEA1_NEGATIVE', 'DEA3', 'DEA4', 'DEA5', 'DEA7', 'FELINE_A', 'FELINE_B', 'FELINE_AB', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('VACCINATION', 'DEWORMING', 'FLEA_TICK_PREVENTION', 'HEALTH_CHECKUP', 'DENTAL_CLEANING', 'MEDICATION', 'GROOMING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('IN_PERSON', 'TELE_VET_VIDEO', 'TELE_VET_CHAT', 'EMERGENCY', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('DIAGNOSIS', 'SURGERY', 'DENTAL', 'VACCINATION', 'DEWORMING', 'LAB_RESULT', 'IMAGING', 'PRESCRIPTION', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PUSH', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "DonorStatus" AS ENUM ('ELIGIBLE', 'INELIGIBLE', 'ON_HOLD', 'PENDING_REVIEW');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "requestedRole" "Role",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "locale" TEXT NOT NULL DEFAULT 'vi',
    "termsAcceptedAt" TIMESTAMP(3),
    "pushToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "sms_otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "specializations" "Species"[],
    "isExoticSpec" BOOLEAN NOT NULL DEFAULT false,
    "clinicId" TEXT,
    "bio" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "avatarUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameUnaccented" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "district" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Hà Nội',
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "imageUrls" TEXT[],
    "status" "ClinicStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "is24h" BOOLEAN NOT NULL DEFAULT false,
    "isExoticSpec" BOOLEAN NOT NULL DEFAULT false,
    "specializations" "Species"[],
    "openingHours" JSONB,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "breed" TEXT,
    "color" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "isNeutered" BOOLEAN NOT NULL DEFAULT false,
    "microchipId" TEXT,
    "passportNumber" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bloodType" "BloodType" NOT NULL DEFAULT 'UNKNOWN',
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "clinicId" TEXT,
    "vetId" TEXT,
    "type" "RecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "attachments" TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "manufacturer" TEXT,
    "batchNumber" TEXT,
    "administeredAt" TIMESTAMP(3) NOT NULL,
    "nextDueAt" TIMESTAMP(3),
    "vetName" TEXT,
    "clinicName" TEXT,
    "certificateUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vaccinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "clinicName" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "drugs" JSONB NOT NULL,
    "instructions" TEXT,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "isPdfReady" BOOLEAN NOT NULL DEFAULT false,
    "pdfUrl" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "vetId" TEXT,
    "type" "ConsultationType" NOT NULL DEFAULT 'IN_PERSON',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "chiefComplaint" TEXT,
    "notes" TEXT,
    "videoRoomUrl" TEXT,
    "totalAmount" DOUBLE PRECISION,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "repeatDays" INTEGER,
    "channel" "NotificationChannel"[],
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inngestJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_donor_profiles" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "status" "DonorStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "lastDonatedAt" TIMESTAMP(3),
    "canDonateAfter" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "isVaccinated" BOOLEAN NOT NULL DEFAULT false,
    "healthNotes" TEXT,
    "ownerConsent" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_donor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_requests" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientPetId" TEXT,
    "bloodType" "BloodType" NOT NULL,
    "species" "Species" NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'urgent',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blood_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_alerts" (
    "id" TEXT NOT NULL,
    "donorProfileId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "isAccepted" BOOLEAN,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "brandNames" TEXT[],
    "category" TEXT NOT NULL,
    "description" TEXT,
    "dosageInfo" TEXT,
    "sideEffects" TEXT,
    "contraindications" TEXT,
    "applicableSpecies" "Species"[],
    "requiresRx" BOOLEAN NOT NULL DEFAULT true,
    "isOtc" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toxic_substances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "drugId" TEXT,
    "toxicFor" "Species"[],
    "severity" TEXT NOT NULL,
    "symptoms" TEXT[],
    "firstAidSteps" TEXT[],
    "antidote" TEXT,
    "references" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toxic_substances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "sms_otps_phone_idx" ON "sms_otps"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "vets_userId_key" ON "vets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vets_licenseNumber_key" ON "vets"("licenseNumber");

-- CreateIndex
CREATE INDEX "vets_clinicId_idx" ON "vets"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_adminUserId_key" ON "clinics"("adminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE INDEX "clinics_city_idx" ON "clinics"("city");

-- CreateIndex
CREATE INDEX "clinics_isVerified_idx" ON "clinics"("isVerified");

-- CreateIndex
CREATE INDEX "clinics_is24h_idx" ON "clinics"("is24h");

-- CreateIndex
CREATE INDEX "clinics_isExoticSpec_idx" ON "clinics"("isExoticSpec");

-- CreateIndex
CREATE UNIQUE INDEX "pets_microchipId_key" ON "pets"("microchipId");

-- CreateIndex
CREATE UNIQUE INDEX "pets_passportNumber_key" ON "pets"("passportNumber");

-- CreateIndex
CREATE INDEX "pets_ownerId_idx" ON "pets"("ownerId");

-- CreateIndex
CREATE INDEX "pets_microchipId_idx" ON "pets"("microchipId");

-- CreateIndex
CREATE INDEX "pets_species_idx" ON "pets"("species");

-- CreateIndex
CREATE INDEX "weight_records_petId_idx" ON "weight_records"("petId");

-- CreateIndex
CREATE INDEX "medical_records_petId_idx" ON "medical_records"("petId");

-- CreateIndex
CREATE INDEX "medical_records_clinicId_idx" ON "medical_records"("clinicId");

-- CreateIndex
CREATE INDEX "medical_records_vetId_idx" ON "medical_records"("vetId");

-- CreateIndex
CREATE INDEX "medical_records_visitDate_idx" ON "medical_records"("visitDate");

-- CreateIndex
CREATE INDEX "vaccinations_petId_idx" ON "vaccinations"("petId");

-- CreateIndex
CREATE INDEX "vaccinations_nextDueAt_idx" ON "vaccinations"("nextDueAt");

-- CreateIndex
CREATE INDEX "prescriptions_petId_idx" ON "prescriptions"("petId");

-- CreateIndex
CREATE INDEX "appointments_clinicId_idx" ON "appointments"("clinicId");

-- CreateIndex
CREATE INDEX "appointments_ownerId_idx" ON "appointments"("ownerId");

-- CreateIndex
CREATE INDEX "appointments_petId_idx" ON "appointments"("petId");

-- CreateIndex
CREATE INDEX "appointments_scheduledAt_idx" ON "appointments"("scheduledAt");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "reminders_petId_idx" ON "reminders"("petId");

-- CreateIndex
CREATE INDEX "reminders_dueAt_idx" ON "reminders"("dueAt");

-- CreateIndex
CREATE INDEX "reminders_isSent_idx" ON "reminders"("isSent");

-- CreateIndex
CREATE UNIQUE INDEX "blood_donor_profiles_petId_key" ON "blood_donor_profiles"("petId");

-- CreateIndex
CREATE INDEX "blood_donor_profiles_bloodType_idx" ON "blood_donor_profiles"("bloodType");

-- CreateIndex
CREATE INDEX "blood_donor_profiles_status_idx" ON "blood_donor_profiles"("status");

-- CreateIndex
CREATE INDEX "blood_requests_clinicId_idx" ON "blood_requests"("clinicId");

-- CreateIndex
CREATE INDEX "blood_requests_bloodType_idx" ON "blood_requests"("bloodType");

-- CreateIndex
CREATE INDEX "blood_requests_species_idx" ON "blood_requests"("species");

-- CreateIndex
CREATE INDEX "donation_alerts_donorProfileId_idx" ON "donation_alerts"("donorProfileId");

-- CreateIndex
CREATE INDEX "donation_alerts_requestId_idx" ON "donation_alerts"("requestId");

-- CreateIndex
CREATE INDEX "drugs_name_idx" ON "drugs"("name");

-- CreateIndex
CREATE INDEX "toxic_substances_name_idx" ON "toxic_substances"("name");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vets" ADD CONSTRAINT "vets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vets" ADD CONSTRAINT "vets_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "vets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "vets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_donor_profiles" ADD CONSTRAINT "blood_donor_profiles_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_alerts" ADD CONSTRAINT "donation_alerts_donorProfileId_fkey" FOREIGN KEY ("donorProfileId") REFERENCES "blood_donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_alerts" ADD CONSTRAINT "donation_alerts_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toxic_substances" ADD CONSTRAINT "toxic_substances_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Fuzzy search indexes used by clinic and pet lookup.
CREATE INDEX IF NOT EXISTS clinics_name_trgm_idx ON clinics USING GIN ("nameUnaccented" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS pets_name_trgm_idx ON pets USING GIN (name gin_trgm_ops);
