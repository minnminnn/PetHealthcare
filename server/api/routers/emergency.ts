import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ClinicStatus } from "@prisma/client";

export const emergencyRouter = createTRPCRouter({
  /**
   * Get 3 nearest 24/7 emergency clinics using PostGIS ST_DWithin.
   * Called when user triggers SOS button.
   */
  getNearestClinics: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(50), // Widen radius for emergency
      })
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
        SELECT
          id, name, address, phone, status,
          latitude, longitude, logo_url AS "logoUrl",
          ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
          ) AS distance_m
        FROM clinics
        WHERE
          location IS NOT NULL
          AND is_24h = true
          AND status IN ('EMERGENCY', 'AVAILABLE')
          AND ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            $3
          )
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
