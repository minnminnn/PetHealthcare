import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ClinicStatus } from "@prisma/client";
import { discoverClinics } from "@/server/services/clinic-discovery";

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
      const clinics = await ctx.db.clinic.findMany({
        where: {
          isVerified: true,
          is24h: true,
          status: { in: [ClinicStatus.EMERGENCY, ClinicStatus.AVAILABLE] },
          latitude: { not: null },
          longitude: { not: null },
        },
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
          specializations: true,
          rating: true,
          reviewCount: true,
          latitude: true,
          longitude: true,
          logoUrl: true,
        },
        take: 250,
      });

      return discoverClinics(clinics, {
        origin: { latitude: input.lat, longitude: input.lng },
        radiusKm: input.radiusKm,
        is24h: true,
        statuses: [ClinicStatus.EMERGENCY, ClinicStatus.AVAILABLE],
        sort: "distance",
        limit: 3,
      }).map((clinic) => ({
        ...clinic,
        callUrl: `tel:${clinic.phone.replace(/[^+\d]/g, "")}`,
        mapsUrl: `/clinics?q=${encodeURIComponent(clinic.name)}`,
      }));
    }),

  /** Get all 24/7 emergency clinics in a city (fallback if no GPS) */
  getEmergencyByCity: publicProcedure
    .input(z.object({ city: z.string().default("Hà Nội") }))
    .query(async ({ ctx, input }) => {
      return ctx.db.clinic.findMany({
        where: {
          isVerified: true,
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
