import assert from "node:assert/strict";
import test from "node:test";

import {
  buildClinicContext,
  createSlidingWindowRateLimiter,
  resolveAIModel,
  triageRequestSchema,
} from "./petcare-ai";

test("AI model resolution never passes an absent model ID to the provider", () => {
  assert.equal(resolveAIModel(undefined), "gemini-3.6-flash");
  assert.equal(resolveAIModel("  "), "gemini-3.6-flash");
  assert.equal(resolveAIModel("gemini-custom"), "gemini-custom");
});

test("triage requests reject empty messages and oversized conversation history", () => {
  assert.equal(
    triageRequestSchema.safeParse({ message: "   ", history: [] }).success,
    false,
  );

  assert.equal(
    triageRequestSchema.safeParse({
      message: "My cat is vomiting",
      history: Array.from({ length: 13 }, (_, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: "Previous context",
      })),
    }).success,
    false,
  );
});

test("triage requests normalize valid location and locale context", () => {
  const result = triageRequestSchema.parse({
    message: "  My dog is limping.  ",
    history: [{ role: "assistant", content: " How long? " }],
    locale: "en",
    location: { latitude: 21.03, longitude: 105.85 },
  });

  assert.deepEqual(result, {
    message: "My dog is limping.",
    history: [{ role: "assistant", content: "How long?" }],
    locale: "en",
    location: { latitude: 21.03, longitude: 105.85 },
  });
});

test("clinic context exposes only verified database facts", () => {
  const context = buildClinicContext([
    {
      name: "Verified Vet",
      address: "12 Main Street",
      phone: "+84 24 1234 5678",
      city: "Hà Nội",
      status: "EMERGENCY",
      is24h: true,
      isVerified: true,
      isExoticSpec: false,
      specializations: ["DOG", "CAT"],
      distanceKm: 1.2,
    },
    {
      name: "Invented Vet",
      address: "Unknown",
      phone: "000",
      city: "Hà Nội",
      status: "AVAILABLE",
      is24h: true,
      isVerified: false,
      isExoticSpec: false,
      specializations: ["DOG"],
      distanceKm: 0.1,
    },
  ]);

  assert.match(context, /Verified Vet/);
  assert.match(context, /Distance: 1\.2 km/);
  assert.doesNotMatch(context, /Invented Vet/);
});

test("rate limiter blocks excess requests and resets after its window", () => {
  let now = 1_000;
  const limiter = createSlidingWindowRateLimiter({
    limit: 2,
    windowMs: 60_000,
    now: () => now,
  });

  assert.equal(limiter.check("user-1").allowed, true);
  assert.equal(limiter.check("user-1").allowed, true);
  assert.equal(limiter.check("user-1").allowed, false);

  now = 61_001;
  assert.equal(limiter.check("user-1").allowed, true);
});
