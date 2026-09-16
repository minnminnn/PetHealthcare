import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Species } from "@prisma/client";

export const searchRouter = createTRPCRouter({
  /**
   * Fuzzy full-text search using pg_trgm similarity.
   * Searches clinic names (unaccented), addresses, and city.
   * Supports Vietnamese unaccented input (e.g. "phong kham meo cau giay").
   */
  clinics: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        species: z.nativeEnum(Species).optional(),
        is24h: z.boolean().optional(),
        isExoticSpec: z.boolean().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, species, is24h, isExoticSpec, lat, lng, limit } = input;

      // Unaccent the query for Vietnamese fuzzy matching
      const unaccentedQuery = query.toLowerCase();

      if (lat !== undefined && lng !== undefined) {
        // Fuzzy search with a portable latitude/longitude distance calculation.
        const results = await ctx.db.$queryRawUnsafe<
          Array<{
            id: string;
            name: string;
            slug: string;
            address: string;
            city: string;
            phone: string;
            status: string;
            is24h: boolean;
            isVerified: boolean;
            isExoticSpec: boolean;
            rating: number;
            logoUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            similarity: number;
            distance_km: number | null;
          }>
        >(
          `
          SELECT
            id, name, slug, address, city, phone, status,
            is_24h AS "is24h", is_verified AS "isVerified",
            is_exotic_spec AS "isExoticSpec", rating, logo_url AS "logoUrl",
            latitude, longitude,
            GREATEST(
              similarity(unaccent(lower(name_unaccented)), unaccent(lower($1))),
              similarity(unaccent(lower(address)), unaccent(lower($1))),
              similarity(unaccent(lower(city)), unaccent(lower($1)))
            ) AS similarity,
            CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN
              6371 * 2 * ASIN(SQRT(LEAST(1,
                POWER(SIN(RADIANS(latitude - $2) / 2), 2) +
                COS(RADIANS($2)) * COS(RADIANS(latitude)) *
                POWER(SIN(RADIANS(longitude - $3) / 2), 2)
              )))
            ELSE NULL END AS distance_km
          FROM clinics
          WHERE
            GREATEST(
              similarity(unaccent(lower(name_unaccented)), unaccent(lower($1))),
              similarity(unaccent(lower(address)), unaccent(lower($1))),
              similarity(unaccent(lower(city)), unaccent(lower($1)))
            ) > 0.1
            ${is24h ? "AND is_24h = true" : ""}
            ${isExoticSpec ? "AND is_exotic_spec = true" : ""}
          ORDER BY similarity DESC, distance_km ASC NULLS LAST
          LIMIT $4
          `,
          unaccentedQuery,
          lat,
          lng,
          limit,
        );

        return results;
      }

      // Pure fuzzy search (no coordinates)
      const results = await ctx.db.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          slug: string;
          address: string;
          city: string;
          phone: string;
          status: string;
          is24h: boolean;
          isVerified: boolean;
          isExoticSpec: boolean;
          rating: number;
          logoUrl: string | null;
          similarity: number;
        }>
      >(
        `
        SELECT
          id, name, slug, address, city, phone, status,
          is_24h AS "is24h", is_verified AS "isVerified",
          is_exotic_spec AS "isExoticSpec", rating, logo_url AS "logoUrl",
          GREATEST(
            similarity(unaccent(lower(name_unaccented)), unaccent(lower($1))),
            similarity(unaccent(lower(address)), unaccent(lower($1)))
          ) AS similarity
        FROM clinics
        WHERE
          GREATEST(
            similarity(unaccent(lower(name_unaccented)), unaccent(lower($1))),
            similarity(unaccent(lower(address)), unaccent(lower($1)))
          ) > 0.08
          ${is24h ? "AND is_24h = true" : ""}
          ${isExoticSpec ? "AND is_exotic_spec = true" : ""}
        ORDER BY similarity DESC
        LIMIT $2
        `,
        unaccentedQuery,
        limit,
      );

      return results;
    }),

  /** Typeahead suggestions — fast, top 5 matches */
  suggestions: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          slug: string;
          city: string;
          logoUrl: string | null;
        }>
      >(
        `
        SELECT id, name, slug, city, logo_url AS "logoUrl"
        FROM clinics
        WHERE
          name_unaccented ILIKE '%' || unaccent($1) || '%'
          OR unaccent(lower(name)) % unaccent(lower($1))
        ORDER BY
          similarity(unaccent(lower(name_unaccented)), unaccent(lower($1))) DESC
        LIMIT 5
        `,
        input.query,
      );
      return results;
    }),
});
