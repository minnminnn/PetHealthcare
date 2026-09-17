import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  clinicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ClinicStatus, Species } from "@prisma/client";
import { env } from "@/env";
import { discoverClinics } from "@/server/services/clinic-discovery";
import { suggestLocations } from "@/server/services/mapbox-geocoding";

const clinicSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  address: true,
  district: true,
  city: true,
  phone: true,
  email: true,
  website: true,
  status: true,
  isVerified: true,
  is24h: true,
  isExoticSpec: true,
  specializations: true,
  rating: true,
  reviewCount: true,
  logoUrl: true,
  coverImageUrl: true,
  imageUrls: true,
  latitude: true,
  longitude: true,
  openingHours: true,
} as const;

const discoveryInput = z
  .object({
    query: z.string().trim().max(200).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().positive().max(200).default(50),
    is24h: z.boolean().optional(),
    species: z.nativeEnum(Species).optional(),
    status: z.nativeEnum(ClinicStatus).optional(),
    sort: z.enum(["distance", "rating"]).default("distance"),
    limit: z.number().int().min(1).max(50).default(20),
  })
  .refine(
    (value) =>
      (value.lat === undefined && value.lng === undefined) ||
      (value.lat !== undefined && value.lng !== undefined),
    { message: "Latitude and longitude must be provided together" },
  );

export const clinicsRouter = createTRPCRouter({
  /** List clinics with optional filters */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(12),
        city: z.string().optional(),
        is24h: z.boolean().optional(),
        isExoticSpec: z.boolean().optional(),
        species: z.nativeEnum(Species).optional(),
        status: z.nativeEnum(ClinicStatus).optional(),
        isVerified: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, ...filters } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(filters.city && {
          city: { contains: filters.city, mode: "insensitive" as const },
        }),
        ...(filters.is24h !== undefined && { is24h: filters.is24h }),
        ...(filters.isExoticSpec !== undefined && {
          isExoticSpec: filters.isExoticSpec,
        }),
        ...(filters.status && { status: filters.status }),
        // Public discovery only exposes records reviewed by the platform.
        isVerified: true,
        ...(filters.species && {
          specializations: { has: filters.species },
        }),
      };

      const [clinics, total] = await ctx.db.$transaction([
        ctx.db.clinic.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
          select: clinicSelect,
        }),
        ctx.db.clinic.count({ where }),
      ]);

      return { clinics, total, pages: Math.ceil(total / limit) };
    }),

  /** Get full clinic detail by slug */
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const clinic = await ctx.db.clinic.findUnique({
        where: { slug: input.slug, isVerified: true },
        include: {
          vets: {
            include: { user: { select: { name: true, image: true } } },
            where: { isVerified: true },
          },
          _count: { select: { appointments: true } },
        },
      });
      if (!clinic) throw new TRPCError({ code: "NOT_FOUND" });
      return clinic;
    }),

  /** Search verified clinic records and rank them using the user's real location. */
  discover: publicProcedure.input(discoveryInput).query(async ({ ctx, input }) => {
    const clinics = await ctx.db.clinic.findMany({
      where: {
        isVerified: true,
        ...(input.is24h !== undefined && { is24h: input.is24h }),
        ...(input.species && { specializations: { has: input.species } }),
        ...(input.status && { status: input.status }),
      },
      select: clinicSelect,
      take: 250,
    });

    return discoverClinics(clinics, {
      query: input.query,
      origin:
        input.lat !== undefined && input.lng !== undefined
          ? { latitude: input.lat, longitude: input.lng }
          : undefined,
      radiusKm:
        input.lat !== undefined && input.lng !== undefined
          ? input.radiusKm
          : undefined,
      is24h: input.is24h,
      species: input.species,
      statuses: input.status ? [input.status] : undefined,
      sort: input.sort,
      limit: input.limit,
    });
  }),

  /** Mapbox-backed address suggestions used to set the discovery origin. */
  locationSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string().trim().min(3).max(200),
        locale: z.enum(["vi", "en"]).default("vi"),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
        limit: z.number().int().min(1).max(10).default(5),
      }),
    )
    .query(async ({ input }) => {
      const accessToken =
        env.MAPBOX_ACCESS_TOKEN ?? env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!accessToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Mapbox is not configured",
        });
      }

      try {
        return await suggestLocations({
          query: input.query,
          locale: input.locale,
          proximity:
            input.lat !== undefined && input.lng !== undefined
              ? { latitude: input.lat, longitude: input.lng }
              : undefined,
          accessToken,
          limit: input.limit,
        });
      } catch (cause) {
        console.error("Mapbox location suggestion request failed", cause);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Location suggestions are temporarily unavailable",
        });
      }
    }),

  /** Backwards-compatible nearby endpoint using the shared discovery service. */
  getNearby: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(10),
        is24h: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const clinics = await ctx.db.clinic.findMany({
        where: {
          isVerified: true,
          latitude: { not: null },
          longitude: { not: null },
          ...(input.is24h !== undefined && { is24h: input.is24h }),
        },
        select: clinicSelect,
        take: 250,
      });

      return discoverClinics(clinics, {
        origin: { latitude: input.lat, longitude: input.lng },
        radiusKm: input.radiusKm,
        is24h: input.is24h,
        sort: "distance",
        limit: 20,
      });
    }),

  /** Update clinic operating status — clinic admin only */
  updateStatus: clinicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        status: z.nativeEnum(ClinicStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clinic = await ctx.db.clinic.findUnique({
        where: { id: input.clinicId },
      });
      if (!clinic) throw new TRPCError({ code: "NOT_FOUND" });
      if (clinic.adminUserId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.clinic.update({
        where: { id: input.clinicId },
        data: { status: input.status },
      });
    }),
});
