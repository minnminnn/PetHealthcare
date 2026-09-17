import { z } from "zod";

const DEFAULT_AI_MODEL = "gemini-3.6-flash";

export function resolveAIModel(value: string | undefined) {
  return value?.trim() || DEFAULT_AI_MODEL;
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
});

export const triageRequestSchema = z.object({
  message: z.string().trim().min(1).max(4_000),
  history: z.array(messageSchema).max(12).default([]),
  locale: z.enum(["vi", "en"]).default("vi"),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

export type TriageRequest = z.infer<typeof triageRequestSchema>;

export interface AIClinicContext {
  name: string;
  address: string;
  phone: string;
  city: string;
  status: string;
  is24h: boolean;
  isVerified: boolean;
  isExoticSpec: boolean;
  specializations: string[];
  distanceKm: number | null;
}

export function buildClinicContext(clinics: readonly AIClinicContext[]) {
  const verifiedClinics = clinics.filter((clinic) => clinic.isVerified);
  if (!verifiedClinics.length) {
    return "No verified clinic results are available for the user's current location. Do not name or invent a clinic. Ask the user to use the clinic finder or share their location.";
  }

  return [
    "VERIFIED CLINIC RESULTS FROM THE APPLICATION DATABASE:",
    ...verifiedClinics.map(
      (clinic, index) =>
        `${index + 1}. ${clinic.name}\n` +
        `   Address: ${clinic.address}, ${clinic.city}\n` +
        `   Phone: ${clinic.phone}\n` +
        `   Status: ${clinic.status}\n` +
        `   24-hour service: ${clinic.is24h ? "Yes" : "No"}\n` +
        `   Species: ${clinic.specializations.join(", ") || "Not specified"}\n` +
        `   Exotic specialist: ${clinic.isExoticSpec ? "Yes" : "No"}\n` +
        `   Distance: ${clinic.distanceKm === null ? "Unavailable" : `${clinic.distanceKm} km`}`,
    ),
    "Use only these exact clinic facts. Do not infer opening hours, services, ratings, staff, or availability that are not listed.",
  ].join("\n");
}

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

export function createSlidingWindowRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions) {
  const requests = new Map<string, number[]>();

  return {
    check(key: string) {
      const currentTime = now();
      const cutoff = currentTime - windowMs;
      const recent = (requests.get(key) ?? []).filter(
        (timestamp) => timestamp > cutoff,
      );

      if (recent.length >= limit) {
        requests.set(key, recent);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((recent[0]! + windowMs - currentTime) / 1_000),
          ),
        };
      }

      recent.push(currentTime);
      requests.set(key, recent);
      return {
        allowed: true,
        remaining: Math.max(0, limit - recent.length),
        retryAfterSeconds: 0,
      };
    },
  };
}
