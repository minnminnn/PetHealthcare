import { createTRPCRouter } from "@/server/api/trpc";
import { petsRouter } from "@/server/api/routers/pets";
import { clinicsRouter } from "@/server/api/routers/clinics";
import { searchRouter } from "@/server/api/routers/search";
import { emergencyRouter } from "@/server/api/routers/emergency";
import { pharmacyRouter } from "@/server/api/routers/pharmacy";
import { appointmentsRouter } from "@/server/api/routers/appointments";
import { medicalRouter } from "@/server/api/routers/medical";
import { remindersRouter } from "@/server/api/routers/reminders";
import { bloodDonorRouter } from "@/server/api/routers/bloodDonor";

/**
 * Root tRPC Router — merges all sub-routers.
 *
 * Access pattern on client:
 *   api.pets.list.useQuery()
 *   api.clinics.getNearby.useQuery({ lat, lng, radiusKm })
 *   api.emergency.getNearestClinics.useQuery({ lat, lng })
 */
export const appRouter = createTRPCRouter({
  pets: petsRouter,
  clinics: clinicsRouter,
  search: searchRouter,
  emergency: emergencyRouter,
  pharmacy: pharmacyRouter,
  appointments: appointmentsRouter,
  medical: medicalRouter,
  reminders: remindersRouter,
  bloodDonor: bloodDonorRouter,
});

export type AppRouter = typeof appRouter;
