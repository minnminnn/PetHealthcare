import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ClinicStatus } from "@prisma/client";

export const emergencyRouter = createTRPCRouter({
  /**
   * Get 3 nearest 24/7 emergency clinics using latitude/longitude distance.
   * Called when user triggers SOS button.
   */
  getNearestClinics: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(50), // Widen radius for emergency
      }),
    )
    .query(async ({ ctx, input }) => {
      const { lat, lng, radiusKm } = input;
      const radiusMeters = radiusKm * 1000;

      const clinics = await ctx.db.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          address: string;
          phone: string;
          status: ClinicStatus;
          latitude: number;
          longitude: number;
          logoUrl: string | null;
          distance_m: number;
        }>
      >(
        `
        SELECT *
        FROM (
          SELECT
            id, name, address, phone, status,
            latitude, longitude, logo_url AS "logoUrl",
            6371000 * 2 * ASIN(SQRT(LEAST(1,
              POWER(SIN(RADIANS(latitude - $1) / 2), 2) +
              COS(RADIANS($1)) * COS(RADIANS(latitude)) *
              POWER(SIN(RADIANS(longitude - $2) / 2), 2)
            ))) AS distance_m
          FROM clinics
          WHERE latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND is_24h = true
            AND status IN ('EMERGENCY', 'AVAILABLE')
        ) AS clinics_with_distance
        WHERE distance_m <= $3
        ORDER BY distance_m ASC
        LIMIT 3
        `,
        lat,
        lng,
        radiusMeters,
      );

      return clinics.map((c) => ({
        ...c,
        distanceKm: Math.round((c.distance_m / 1000) * 10) / 10,
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`,
        callUrl: `tel:${c.phone.replace(/\s/g, "")}`,
      }));
    }),

  /** Get all 24/7 emergency clinics in a city (fallback if no GPS) */
  getEmergencyByCity: publicProcedure
    .input(z.object({ city: z.string().default("Hà Nội") }))
    .query(async ({ ctx, input }) => {
      return ctx.db.clinic.findMany({
        where: {
          city: { contains: input.city, mode: "insensitive" },
          is24h: true,
          status: { in: [ClinicStatus.EMERGENCY, ClinicStatus.AVAILABLE] },
        },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          status: true,
          latitude: true,
          longitude: true,
          logoUrl: true,
          rating: true,
        },
        orderBy: { rating: "desc" },
        take: 10,
      });
    }),
});
