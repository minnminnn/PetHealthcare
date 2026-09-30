import { z } from "zod";
import { Role, Species } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  clinicProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { requireClinicAccess } from "@/server/authz/clinic-access";

export const managementRouter = createTRPCRouter({
  bookingOptions: publicProcedure.query(({ ctx }) =>
    ctx.db.clinic.findMany({
      where: { isVerified: true, admin: { isActive: true } },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        specializations: true,
        vets: {
          where: { isVerified: true, user: { isActive: true } },
          select: {
            id: true,
            specializations: true,
            yearsExperience: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ),
  myClinics: clinicProcedure.query(({ ctx }) =>
    ctx.db.clinic.findMany({
      where:
        ctx.session.user.role === Role.SYSTEM_ADMIN
          ? {}
          : ctx.session.user.role === Role.CLINIC_ADMIN
            ? { adminUserId: ctx.session.user.id }
            : { vets: { some: { userId: ctx.session.user.id } } },
      select: {
        id: true,
        name: true,
        status: true,
        isVerified: true,
        vets: {
          select: {
            id: true,
            licenseNumber: true,
            isVerified: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ),
  addVet: clinicProcedure
    .input(
      z.object({
        clinicId: z.string().min(1),
        email: z.string().trim().email().toLowerCase(),
        licenseNumber: z.string().trim().min(3).max(100),
        specializations: z.array(z.nativeEnum(Species)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role === Role.VET)
        throw new TRPCError({ code: "FORBIDDEN" });
      await requireClinicAccess(ctx.db, ctx.session.user, input.clinicId);
      return ctx.db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { email: input.email },
          select: {
            id: true,
            role: true,
            isActive: true,
            requestedRole: true,
            vetProfile: { select: { id: true } },
          },
        });
        if (
          !user?.isActive ||
          user.role !== Role.OWNER ||
          user.vetProfile ||
          user.requestedRole
        )
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Use an active owner account without another role request / Cần tài khoản chủ nuôi đang hoạt động và không có yêu cầu cấp quyền khác",
          });
        const changed = await tx.user.updateMany({
          where: {
            id: user.id,
            role: Role.OWNER,
            isActive: true,
            requestedRole: null,
          },
          data: { role: Role.VET },
        });
        if (!changed.count) throw new TRPCError({ code: "CONFLICT" });
        return tx.vet.create({
          data: {
            userId: user.id,
            clinicId: input.clinicId,
            licenseNumber: input.licenseNumber,
            specializations: input.specializations,
            isVerified: true,
          },
        });
      });
    }),
  requests: adminProcedure.query(({ ctx }) =>
    ctx.db.user.findMany({
      where: { requestedRole: Role.CLINIC_ADMIN, isActive: true },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
  ),
  reviewClinic: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        approve: z.boolean(),
        clinic: z
          .object({
            name: z.string().trim().min(2).max(200),
            address: z.string().trim().min(5).max(500),
            city: z.string().trim().min(2).max(100),
            phone: z.string().trim().min(8).max(30),
            specializations: z.array(z.nativeEnum(Species)).min(1),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.approve && !input.clinic)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Clinic details are required",
        });
      return ctx.db.$transaction(async (tx) => {
        const changed = await tx.user.updateMany({
          where: {
            id: input.userId,
            isActive: true,
            role: Role.OWNER,
            requestedRole: Role.CLINIC_ADMIN,
          },
          data: {
            requestedRole: null,
            ...(input.approve ? { role: Role.CLINIC_ADMIN } : {}),
          },
        });
        if (!changed.count)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Request already processed / Yêu cầu đã được xử lý",
          });
        if (input.approve && input.clinic) {
          await tx.clinic.create({
            data: {
              ...input.clinic,
              adminUserId: input.userId,
              slug: `clinic-${input.userId}`,
              nameUnaccented: input.clinic.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .toLowerCase(),
              imageUrls: [],
              isVerified: true,
            },
          });
        }
        return { ok: true };
      });
    }),
});
