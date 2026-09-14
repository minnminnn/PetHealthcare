import { z } from "zod";
import { createTRPCRouter, publicProcedure, clinicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ClinicStatus, Species } from "@prisma/client";

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
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, ...filters } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(filters.city && { city: { contains: filters.city, mode: "insensitive" as const } }),
        ...(filters.is24h !== undefined && { is24h: filters.is24h }),
        ...(filters.isExoticSpec !== undefined && { isExoticSpec: filters.isExoticSpec }),
        ...(filters.status && { status: filters.status }),
        ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
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
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            district: true,
            city: true,
            phone: true,
            status: true,
            isVerified: true,
            is24h: true,
            isExoticSpec: true,
            specializations: true,
            rating: true,
            reviewCount: true,
            logoUrl: true,
            coverImageUrl: true,
            latitude: true,
            longitude: true,
            openingHours: true,
          },
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
        where: { slug: input.slug },
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

  /** Find clinics within radius using PostGIS ST_DWithin */
  getNearby: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(10),
        is24h: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { lat, lng, radiusKm, is24h } = input;
      const radiusMeters = radiusKm * 1000;

      // Use PostGIS ST_DWithin for spatial query + ST_Distance for ordering
      const clinics = await ctx.db.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          slug: string;
          address: string;
          phone: string;
          status: ClinicStatus;
          is24h: boolean;
          isVerified: boolean;
          isExoticSpec: boolean;
          rating: number;
          latitude: number;
          longitude: number;
          logoUrl: string | null;
          distance_m: number;
        }>
      >(
        `
        SELECT
          id, name, slug, address, phone, status, is_24h AS "is24h",
          is_verified AS "isVerified", is_exotic_spec AS "isExoticSpec",
          rating, latitude, longitude, logo_url AS "logoUrl",
          ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
          ) AS distance_m
        FROM clinics
        WHERE
          location IS NOT NULL
          AND ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            $3
          )
          ${is24h ? "AND is_24h = true" : ""}
        ORDER BY distance_m ASC
        LIMIT 20
        `,
        lat,
        lng,
        radiusMeters,
      );

      return clinics.map((c) => ({
        ...c,
        distanceKm: Math.round((c.distance_m / 1000) * 10) / 10,
      }));
    }),

  /** Update clinic operating status — clinic admin only */
  updateStatus: clinicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        status: z.nativeEnum(ClinicStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clinic = await ctx.db.clinic.findUnique({ where: { id: input.clinicId } });
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
