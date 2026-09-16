import { Role, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function requireClinicAccess(
  db: PrismaClient,
  user: { id: string; role: Role },
  clinicId: string,
) {
  if (user.role === Role.SYSTEM_ADMIN) return;

  const clinic =
    user.role === Role.CLINIC_ADMIN
      ? await db.clinic.findFirst({
          where: { id: clinicId, adminUserId: user.id },
          select: { id: true },
        })
      : user.role === Role.VET
        ? await db.clinic.findFirst({
            where: { id: clinicId, vets: { some: { userId: user.id } } },
            select: { id: true },
          })
        : null;

  if (!clinic) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Clinic not found" });
  }
}
