import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Species, type Medication } from "@prisma/client";

type MedicationCategory =
  "antibiotic" | "antiparasitic" | "supplement" | "other";

const CATEGORY_PATTERNS: Record<
  Exclude<MedicationCategory, "other">,
  RegExp
> = {
  antibiotic: /antibiotic|antimicrobial|bacterial|infection/i,
  antiparasitic: /parasit|flea|tick|worm|mite|heartworm|coccidi|giardia/i,
  supplement:
    /supplement|vitamin|mineral|probiotic|nutritional|nutrition|electrolyte|omega|joint support|liver support|renal support/i,
};

function getMedicationCategory(medication: Medication): MedicationCategory {
  const searchableText = `${medication.name} ${medication.primaryUseCase}`;

  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(searchableText)) return category as MedicationCategory;
  }

  return "other";
}

function getMedicationSpecies(medication: Medication): Species[] {
  const searchableText = `${medication.name} ${medication.primaryUseCase}`;
  const species = new Set<Species>();

  if (/canine|\bdog\b/i.test(searchableText)) species.add(Species.DOG);
  if (/feline|\bcat\b/i.test(searchableText)) species.add(Species.CAT);
  if (/\brabbit\b/i.test(searchableText)) species.add(Species.RABBIT);

  return Array.from(species);
}

function normalizeMedication(medication: Medication) {
  return {
    id: medication.id,
    name: medication.name,
    category: getMedicationCategory(medication),
    description: medication.primaryUseCase,
    dosageInfo: medication.estimatedPriceVND,
    applicableSpecies: getMedicationSpecies(medication),
    toxicAlerts: [],
    administrationType: medication.type,
    tier: medication.tier,
  };
}

export const pharmacyRouter = createTRPCRouter({
  /** List the seeded medication catalog with optional filters. */
  listDrugs: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        species: z.nativeEnum(Species).optional(),
        requiresRx: z.boolean().optional(),
        category: z.string().max(100).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, species, page, limit, category } = input;
      const skip = (page - 1) * limit;

      if (category === "toxic") {
        const where = {
          ...(query && {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { aliases: { has: query } },
            ],
          }),
          ...(species && { toxicFor: { has: species } }),
        };
        const [substances, total] = await ctx.db.$transaction([
          ctx.db.toxicSubstance.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: "asc" },
          }),
          ctx.db.toxicSubstance.count({ where }),
        ]);

        return {
          drugs: substances.map((substance) => ({
            id: substance.id,
            name: substance.name,
            category: "toxic" as const,
            description: substance.symptoms.join(", "),
            dosageInfo:
              substance.antidote ?? "Contact a veterinarian immediately",
            applicableSpecies: substance.toxicFor,
            toxicAlerts: [
              {
                toxicFor: substance.toxicFor,
                severity: substance.severity,
              },
            ],
            administrationType: "Avoid",
            tier: substance.severity,
          })),
          total,
        };
      }

      const medications = await ctx.db.medication.findMany({
        where: query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { type: { contains: query, mode: "insensitive" } },
                { tier: { contains: query, mode: "insensitive" } },
                {
                  primaryUseCase: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : undefined,
        orderBy: { name: "asc" },
      });

      const filtered = medications
        .map(normalizeMedication)
        .filter(
          (medication) =>
            (!category || medication.category === category) &&
            (!species || medication.applicableSpecies.includes(species)),
        );

      return {
        drugs: filtered.slice(skip, skip + limit),
        total: filtered.length,
      };
    }),

  /** Get toxic substances — the blacklist */
  getToxicSubstances: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        species: z.nativeEnum(Species).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, species } = input;

      const where = {
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { aliases: { has: query } },
          ],
        }),
        ...(species && { toxicFor: { has: species } }),
      };

      return ctx.db.toxicSubstance.findMany({
        where,
        orderBy: [{ severity: "desc" }, { name: "asc" }],
      });
    }),

  /** Check if a substance is toxic for a specific species */
  checkToxicity: publicProcedure
    .input(
      z.object({
        substanceName: z.string().min(1),
        species: z.nativeEnum(Species).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { substanceName, species } = input;

      // pg_trgm fuzzy check
      const matches = await ctx.db.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          toxicFor: Species[];
          severity: string;
          symptoms: string[];
          firstAidSteps: string[];
          antidote: string | null;
          similarity: number;
        }>
      >(
        `
        SELECT id, name, "toxicFor", severity,
               symptoms, "firstAidSteps", antidote,
               similarity(unaccent(lower(name)), unaccent(lower($1))) AS similarity
        FROM toxic_substances
        WHERE similarity(unaccent(lower(name)), unaccent(lower($1))) > 0.2
           OR $1 = ANY(aliases)
        ORDER BY similarity DESC
        LIMIT 5
        `,
        substanceName,
      );

      if (!matches.length) return { isToxic: false, matches: [] };

      const relevantMatches = species
        ? matches.filter((m) => m.toxicFor.includes(species))
        : matches;

      return {
        isToxic: relevantMatches.length > 0,
        matches: relevantMatches,
      };
    }),
});
