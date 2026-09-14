import { z } from "zod";
import { createTRPCRouter, protectedProcedure, clinicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { RecordType, Role } from "@prisma/client";

export const medicalRouter = createTRPCRouter({
  /** Create a medical record — VET/CLINIC_ADMIN only */
  createRecord: clinicProcedure
    .input(z.object({
      petId: z.string(),
      clinicId: z.string().optional(),
      type: z.nativeEnum(RecordType),
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      diagnosis: z.string().optional(),
      treatment: z.string().optional(),
      attachments: z.array(z.string().url()).default([]),
      isPrivate: z.boolean().default(false),
      visitDate: z.date().default(() => new Date()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify pet exists
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });

      // Get vet profile for current user
      const vetProfile = await ctx.db.vet.findUnique({ where: { userId: ctx.session.user.id } });

      return ctx.db.medicalRecord.create({
        data: {
          ...input,
          vetId: vetProfile?.id ?? undefined,
        },
      });
    }),

  /** Add vaccination stamp — VET only */
  addVaccination: clinicProcedure
    .input(z.object({
      petId: z.string(),
      vaccineName: z.string().min(1),
      manufacturer: z.string().optional(),
      batchNumber: z.string().optional(),
      administeredAt: z.date(),
      nextDueAt: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });

      const [vax] = await ctx.db.$transaction([
        ctx.db.vaccination.create({
          data: {
            ...input,
            vetName: ctx.session.user.name ?? undefined,
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
          },
        }),
      ]);

      return vax;
    }),

  /** Create prescription — VET only */
  createPrescription: clinicProcedure
    .input(z.object({
      petId: z.string(),
      drugs: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
        notes: z.string().optional(),
      })),
      instructions: z.string().optional(),
      validUntil: z.date().optional(),
      refills: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({ where: { id: input.petId } });
      if (!pet) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.prescription.create({
        data: {
          petId: input.petId,
          issuedBy: ctx.session.user.name ?? "Unknown Vet",
          drugs: input.drugs,
          instructions: input.instructions,
          validUntil: input.validUntil,
          refills: input.refills,
        },
      });
    }),

  /** Push attachment to pet record — clinic dispatch feature */
  addAttachmentToRecord: clinicProcedure
    .input(z.object({
      recordId: z.string(),
      attachmentUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.medicalRecord.findUnique({ where: { id: input.recordId } });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.medicalRecord.update({
        where: { id: input.recordId },
        data: {
          attachments: { push: input.attachmentUrl },
        },
      });
    }),
});
