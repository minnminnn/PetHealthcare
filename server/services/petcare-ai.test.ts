import assert from "node:assert/strict";
import test from "node:test";

import {
  buildClinicContext,
  createSlidingWindowRateLimiter,
  resolveAIProviderConfig,
  resolveAIModel,
  triageRequestSchema,
} from "./petcare-ai";

test("AI model resolution never passes an absent model ID to the provider", () => {
  assert.equal(resolveAIModel(undefined), "openai/gpt-oss-20b");
  assert.equal(resolveAIModel("  "), "openai/gpt-oss-20b");
  assert.equal(resolveAIModel("gemini-custom"), "gemini-custom");
});

test("AI provider resolution falls back to the configured Google key", () => {
  assert.deepEqual(
    resolveAIProviderConfig({
      googleApiKey: "google-test-key",
    }),
    {
      provider: "google",
      apiKey: "google-test-key",
      model: "gemini-3.7-flash",
    },
  );
});

test("AI provider resolution prefers Groq when both providers are configured", () => {
  assert.deepEqual(
    resolveAIProviderConfig({
      groqApiKey: "groq-test-key",
      groqModel: "custom-groq-model",
      googleApiKey: "google-test-key",
      googleModel: "custom-google-model",
    }),
    {
      provider: "groq",
      apiKey: "groq-test-key",
      model: "custom-groq-model",
    },
  );
});

test("AI provider resolution reports missing provider configuration", () => {
  assert.equal(resolveAIProviderConfig({}), null);
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

test("fictional demo clinics are not presented as verified care options to AI", () => {
  const context = buildClinicContext([
    {
      name: "[DEMO] PetCare Đa khoa Hà Nội",
      address: "Địa chỉ mô phỏng",
      phone: "",
      city: "Hà Nội",
      status: "EMERGENCY",
      is24h: true,
      isVerified: true,
      isExoticSpec: true,
      specializations: ["DOG", "CAT"],
      distanceKm: 0.1,
    },
  ]);
  assert.doesNotMatch(context, /PetCare Đa khoa/);
  assert.match(context, /Do not name or invent a clinic/);
});
