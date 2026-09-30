import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
loadEnvConfig(process.cwd());
const input = z
  .object({
    ADMIN_EMAIL: z.string().trim().email().toLowerCase(),
    ADMIN_PASSWORD: z.string().min(12).max(72),
  })
  .parse(process.env);
const db = new PrismaClient();
async function main() {
  const existing = await db.user.findUnique({
    where: { email: input.ADMIN_EMAIL },
    select: { id: true },
  });
  if (existing)
    throw new Error(
      "Account already exists; this command never changes an existing account's role or password.",
    );
  await db.user.create({
    data: {
      email: input.ADMIN_EMAIL,
      name: "System administrator",
      role: "SYSTEM_ADMIN",
      passwordHash: await bcrypt.hash(input.ADMIN_PASSWORD, 12),
      isActive: true,
    },
  });
  console.log(
    "Administrator created. Sign in with the configured credentials.",
  );
}
main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Failed to create admin",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
