import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Species } from "@prisma/client";

export const pharmacyRouter = createTRPCRouter({
  /** List drugs with optional search */
  listDrugs: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      species: z.nativeEnum(Species).optional(),
      requiresRx: z.boolean().optional(),
      category: z.string().max(100).optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(12),
    }))
    .query(async ({ ctx, input }) => {
      const { query, species, requiresRx, page, limit, category } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(category === "toxic" ? { toxicAlerts: { some: {} } } : category ? { category } : {}),
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { genericName: { contains: query, mode: "insensitive" as const } },
            { brandNames: { has: query } },
          ],
        }),
        ...(species && { applicableSpecies: { has: species } }),
        ...(requiresRx !== undefined && { requiresRx }),
      };

      const [drugs, total] = await ctx.db.$transaction([
        ctx.db.drug.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: "asc" },
          include: { toxicAlerts: { select: { toxicFor: true, severity: true } } },
        }),
        ctx.db.drug.count({ where }),
      ]);

      return { drugs, total };
    }),

  /** Get toxic substances — the blacklist */
  getToxicSubstances: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      species: z.nativeEnum(Species).optional(),
    }))
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
    .input(z.object({
      substanceName: z.string().min(1),
      species: z.nativeEnum(Species).optional(),
    }))
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
