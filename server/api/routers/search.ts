import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Species } from "@prisma/client";
import { discoverClinics } from "@/server/services/clinic-discovery";

const searchSelect = {
  id: true,
  name: true,
  slug: true,
  address: true,
  district: true,
  city: true,
  phone: true,
  status: true,
  is24h: true,
  isVerified: true,
  isExoticSpec: true,
  specializations: true,
  rating: true,
  reviewCount: true,
  logoUrl: true,
  latitude: true,
  longitude: true,
} as const;

export const searchRouter = createTRPCRouter({
  /** Compatibility endpoint for global clinic search. */
  clinics: publicProcedure
    .input(
      z
        .object({
          query: z.string().trim().min(1).max(200),
          species: z.nativeEnum(Species).optional(),
          is24h: z.boolean().optional(),
          isExoticSpec: z.boolean().optional(),
          lat: z.number().min(-90).max(90).optional(),
          lng: z.number().min(-180).max(180).optional(),
          limit: z.number().int().min(1).max(50).default(10),
        })
        .refine(
          (value) =>
            (value.lat === undefined && value.lng === undefined) ||
            (value.lat !== undefined && value.lng !== undefined),
          { message: "Latitude and longitude must be provided together" },
        ),
    )
    .query(async ({ ctx, input }) => {
      const candidates = await ctx.db.clinic.findMany({
        where: {
          isVerified: true,
          ...(input.is24h !== undefined && { is24h: input.is24h }),
          ...(input.isExoticSpec !== undefined && {
            isExoticSpec: input.isExoticSpec,
          }),
          ...(input.species && { specializations: { has: input.species } }),
        },
        select: searchSelect,
        take: 250,
      });

      return discoverClinics(candidates, {
        query: input.query,
        origin:
          input.lat !== undefined && input.lng !== undefined
            ? { latitude: input.lat, longitude: input.lng }
            : undefined,
        is24h: input.is24h,
        species: input.species,
        sort:
          input.lat !== undefined && input.lng !== undefined
            ? "distance"
            : "rating",
        limit: input.limit,
      });
    }),

  /** Verified clinic typeahead; no extension-specific SQL required. */
  suggestions: publicProcedure
    .input(z.object({ query: z.string().trim().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const candidates = await ctx.db.clinic.findMany({
        where: { isVerified: true },
        select: searchSelect,
        take: 250,
      });

      return discoverClinics(candidates, {
        query: input.query,
        sort: "rating",
        limit: 5,
      }).map(({ id, name, slug, city, logoUrl }) => ({
        id,
        name,
        slug,
        city,
        logoUrl,
      }));
    }),
});
