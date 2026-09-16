import { Role, type Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export type PetAccessPermissions = {
  canView: boolean;
  canEditProfile: boolean;
  canAddWeight: boolean;
  canManageReminders: boolean;
  canWriteMedicalRecords: boolean;
  canManageSharing: boolean;
  canPrint: boolean;
};

type SessionUser = {
  id: string;
  role: Role;
};

type PetAccess = {
  pet: {
    id: string;
    ownerId: string;
  };
  permissions: PetAccessPermissions;
  clinicId: string | null;
  vetId: string | null;
};

/**
 * Resolves access to a pet without leaking whether an inaccessible pet exists.
 * Clinical access requires an existing appointment or medical record associated
 * with the current vet or clinic.
 */
export async function requirePetAccess(
  db: PrismaClient,
  user: SessionUser,
  petId: string,
): Promise<PetAccess> {
  const pet = await db.pet.findFirst({
    where: { id: petId, isActive: true },
    select: { id: true, ownerId: true },
  });

  if (!pet) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
  }

  if (pet.ownerId === user.id) {
    return {
      pet,
      clinicId: null,
      vetId: null,
      permissions: {
        canView: true,
        canEditProfile: true,
        canAddWeight: true,
        canManageReminders: true,
        canWriteMedicalRecords: false,
        canManageSharing: true,
        canPrint: true,
      },
    };
  }

  if (user.role === Role.SYSTEM_ADMIN) {
    return {
      pet,
      clinicId: null,
      vetId: null,
      permissions: {
        canView: true,
        canEditProfile: true,
        canAddWeight: true,
        canManageReminders: false,
        canWriteMedicalRecords: true,
        canManageSharing: false,
        canPrint: true,
      },
    };
  }

  let clinicId: string | null = null;
  let vetId: string | null = null;

  if (user.role === Role.VET) {
    const vet = await db.vet.findUnique({
      where: { userId: user.id },
      select: { id: true, clinicId: true },
    });
    vetId = vet?.id ?? null;
    clinicId = vet?.clinicId ?? null;
  } else if (user.role === Role.CLINIC_ADMIN) {
    const clinic = await db.clinic.findUnique({
      where: { adminUserId: user.id },
      select: { id: true },
    });
    clinicId = clinic?.id ?? null;
  }

  if (vetId || clinicId) {
    const relationshipFilters: Prisma.PetWhereInput[] = [];

    if (vetId) {
      relationshipFilters.push(
        { appointments: { some: { vetId } } },
        { medicalRecords: { some: { vetId } } },
      );
    }

    if (clinicId) {
      relationshipFilters.push(
        { appointments: { some: { clinicId } } },
        { medicalRecords: { some: { clinicId } } },
      );
    }

    const relationship = await db.pet.findFirst({
      where: {
        id: pet.id,
        OR: relationshipFilters,
      },
      select: { id: true },
    });

    if (relationship) {
      return {
        pet,
        clinicId,
        vetId,
        permissions: {
          canView: true,
          canEditProfile: false,
          canAddWeight: true,
          canManageReminders: false,
          canWriteMedicalRecords: true,
          canManageSharing: false,
          canPrint: true,
        },
      };
    }
  }

  // Return the same response as a missing record to avoid an ID enumeration leak.
  throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
}

export function requirePermission(
  permissions: PetAccessPermissions,
  permission: keyof PetAccessPermissions,
) {
  if (!permissions[permission]) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
}
