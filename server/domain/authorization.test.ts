import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import { requireClinicAccess } from "../authz/clinic-access";

test("staff from clinic A cannot manage clinic B even if a pet visits both", async () => {
  const db = {
    clinic: {
      findFirst: async ({
        where,
      }: {
        where: {
          id: string;
          adminUserId?: string;
          vets?: { some: { userId: string } };
        };
      }) => {
        if (
          where.id === "clinic-a" &&
          (where.adminUserId === "admin-a" ||
            where.vets?.some.userId === "vet-a")
        )
          return { id: "clinic-a" };
        return null;
      },
    },
  } as unknown as PrismaClient;
  for (const user of [
    { id: "admin-a", role: "CLINIC_ADMIN" },
    { id: "vet-a", role: "VET" },
  ] as const) {
    await requireClinicAccess(db, user, "clinic-a");
    await assert.rejects(requireClinicAccess(db, user, "clinic-b"), {
      code: "NOT_FOUND",
    });
  }
  await assert.rejects(
    requireClinicAccess(db, { id: "owner", role: "OWNER" }, "clinic-a"),
    { code: "NOT_FOUND" },
  );
});
