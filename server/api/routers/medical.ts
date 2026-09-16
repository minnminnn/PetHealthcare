import { z } from "zod";
import { createTRPCRouter, clinicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { RecordType, Role } from "@prisma/client";
import { requirePermission, requirePetAccess } from "@/server/authz/pet-access";

export const medicalRouter = createTRPCRouter({
  /** Create a medical record — VET/CLINIC_ADMIN only */
  createRecord: clinicProcedure
    .input(
      z.object({
        petId: z.string(),
        clinicId: z.string().optional(),
        type: z.nativeEnum(RecordType),
        title: z.string().min(1).max(200),
        description: z.string().max(10_000).optional(),
        diagnosis: z.string().max(10_000).optional(),
        treatment: z.string().max(10_000).optional(),
        attachments: z.array(z.string().url()).default([]),
        isPrivate: z.boolean().default(false),
        visitDate: z.date().default(() => new Date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await requirePetAccess(
        ctx.db,
        ctx.session.user,
        input.petId,
      );
      requirePermission(access.permissions, "canWriteMedicalRecords");

      if (
        input.clinicId &&
        ctx.session.user.role !== Role.SYSTEM_ADMIN &&
        input.clinicId !== access.clinicId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot write records for this clinic",
        });
      }

      return ctx.db.medicalRecord.create({
        data: {
          ...input,
          clinicId: input.clinicId ?? access.clinicId ?? undefined,
          vetId: access.vetId ?? undefined,
        },
      });
    }),

  /** Add vaccination stamp — VET only */
  addVaccination: clinicProcedure
    .input(
      z.object({
        petId: z.string(),
        vaccineName: z.string().min(1).max(200),
        manufacturer: z.string().max(200).optional(),
        batchNumber: z.string().max(100).optional(),
        administeredAt: z.date(),
        nextDueAt: z.date().optional(),
        notes: z.string().max(2_000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await requirePetAccess(
        ctx.db,
        ctx.session.user,
        input.petId,
      );
      requirePermission(access.permissions, "canWriteMedicalRecords");
      const clinic = access.clinicId
        ? await ctx.db.clinic.findUnique({
            where: { id: access.clinicId },
            select: { name: true },
          })
        : null;

      const [vax] = await ctx.db.$transaction([
        ctx.db.vaccination.create({
          data: {
            ...input,
            vetName: ctx.session.user.name ?? undefined,
            clinicName: clinic?.name ?? undefined,
          },
        }),
        // Also create a medical record for the vaccination
        ctx.db.medicalRecord.create({
          data: {
            petId: input.petId,
            type: "VACCINATION",
            title: `Tiêm phòng: ${input.vaccineName}`,
            description: input.notes,
            visitDate: input.administeredAt,
            clinicId: access.clinicId ?? undefined,
            vetId: access.vetId ?? undefined,
          },
        }),
      ]);

      return vax;
    }),

  /** Create prescription — VET only */
  createPrescription: clinicProcedure
    .input(
      z.object({
        petId: z.string(),
        drugs: z.array(
          z.object({
            name: z.string().min(1).max(200),
            dosage: z.string().min(1).max(200),
            frequency: z.string().min(1).max(200),
            duration: z.string().min(1).max(200),
            notes: z.string().max(1_000).optional(),
          }),
        ),
        instructions: z.string().max(5_000).optional(),
        validUntil: z.date().optional(),
        refills: z.number().int().min(0).max(24).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await requirePetAccess(
        ctx.db,
        ctx.session.user,
        input.petId,
      );
      requirePermission(access.permissions, "canWriteMedicalRecords");
      const clinic = access.clinicId
        ? await ctx.db.clinic.findUnique({
            where: { id: access.clinicId },
            select: { name: true },
          })
        : null;

      return ctx.db.prescription.create({
        data: {
          petId: input.petId,
          issuedBy: ctx.session.user.name ?? "Unknown Vet",
          clinicName: clinic?.name ?? undefined,
          drugs: input.drugs,
          instructions: input.instructions,
          validUntil: input.validUntil,
          refills: input.refills,
        },
      });
    }),

  /** Push attachment to pet record — clinic dispatch feature */
  addAttachmentToRecord: clinicProcedure
    .input(
      z.object({
        recordId: z.string(),
        attachmentUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.medicalRecord.findUnique({
        where: { id: input.recordId },
        select: { id: true, petId: true },
      });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });

      const access = await requirePetAccess(
        ctx.db,
        ctx.session.user,
        record.petId,
      );
      requirePermission(access.permissions, "canWriteMedicalRecords");

      return ctx.db.medicalRecord.update({
        where: { id: input.recordId },
        data: {
          attachments: { push: input.attachmentUrl },
        },
      });
    }),
});
