import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { env } from "@/env";
import { db } from "@/server/db";
import { PETCARE_SYSTEM_PROMPT } from "@/server/ai/petcare-system-prompt";
import { discoverClinics } from "@/server/services/clinic-discovery";
import {
  buildClinicContext,
  createSlidingWindowRateLimiter,
  resolveAIModel,
  triageRequestSchema,
} from "@/server/services/petcare-ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const rateLimiter = createSlidingWindowRateLimiter({
  limit: 10,
  windowMs: 60_000,
});

function requestIdentity(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 64_000) {
    return NextResponse.json(
      { error: "Request is too large" },
      { status: 413 },
    );
  }

  const rateLimit = rateLimiter.check(requestIdentity(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const input = triageRequestSchema.parse(await request.json());
    const clinicContext = input.location
      ? await getClinicContext(input.location)
      : buildClinicContext([]);
    const languageInstruction =
      input.locale === "vi"
        ? "Reply in Vietnamese unless the user clearly asks for another language."
        : "Reply in English unless the user clearly asks for another language.";

    const result = await streamText({
      model: google(resolveAIModel(env.GOOGLE_GENERATIVE_AI_MODEL)),
      system: `${PETCARE_SYSTEM_PROMPT}\n\n${languageInstruction}\n\n${clinicContext}`,
      messages: [
        ...input.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user" as const, content: input.message },
      ],
      temperature: 0.2,
      // Gemini 3.x uses part of this budget for internal reasoning.
      // Keep enough headroom so the visible safety guidance is not cut off.
      maxTokens: 1_800,
      abortSignal: request.signal,
    });
    console.log(result)

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid pet-care request" },
        { status: 400 },
      );
    }

    console.error("PetCare AI request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "PetCare AI is temporarily unavailable" },
      { status: 503 },
    );
  }
}

async function getClinicContext(location: {
  latitude: number;
  longitude: number;
}) {
  const candidates = await db.clinic.findMany({
    where: {
      isVerified: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
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
      latitude: true,
      longitude: true,
    },
    take: 250,
  });

  const nearbyClinics = discoverClinics(candidates, {
    origin: location,
    radiusKm: 100,
    sort: "distance",
    limit: 5,
  });

  return buildClinicContext(nearbyClinics);
}
