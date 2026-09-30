import { PrismaClient, type Prisma } from "@prisma/client";

import medicationsData from "./medications.json";

const prisma = new PrismaClient();

const medications =
  medicationsData satisfies Prisma.MedicationCreateManyInput[];

async function main() {
  const { count } = await prisma.medication.createMany({
    data: medications,
    skipDuplicates: true,
  });

  console.log(
    `Medication seed complete: ${count} inserted, ${medications.length - count} skipped.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Medication seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
