import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { matchClinicNames } from "../lib/clinic-name-matching";
const recordsSchema = z.array(
  z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
      name: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
    })
    .passthrough(),
);
const referenceSchema = z.array(
  z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    phone: z.string().nullable(),
  }),
);
async function main() {
  const [input, output, referencePath = "data/clinic-name-reference.json"] =
    process.argv.slice(2);
  if (!input || !output)
    throw new Error(
      "Usage: npm run clinics:match -- current.json updated.json [reference.json]",
    );
  if (resolve(input) === resolve(output))
    throw new Error(
      "Choose a separate output file; the input is never overwritten.",
    );
  const records = recordsSchema.parse(
    JSON.parse(await readFile(input, "utf8")),
  );
  const reference = referenceSchema.parse(
    JSON.parse(await readFile(referencePath, "utf8")),
  );
  const { updated, report } = matchClinicNames(records, reference);
  await writeFile(output, JSON.stringify(updated, null, 2) + "\n", {
    flag: "wx",
  });
  await writeFile(
    `${output}.report.json`,
    JSON.stringify(report, null, 2) + "\n",
    { flag: "wx" },
  );
  console.log(
    JSON.stringify({
      records: records.length,
      updated: report.filter((r) => r.status === "updated").length,
      review: report.filter((r) => r.status === "review").length,
      unmatched: report.filter((r) => r.status === "unmatched").length,
      output,
    }),
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Matching failed");
  process.exitCode = 1;
});
