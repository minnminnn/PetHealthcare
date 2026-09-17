import assert from "node:assert/strict";
import test from "node:test";

import { discoverClinics } from "./clinic-discovery";

const clinics = [
  {
    id: "near",
    name: "Phòng khám Thú y Tây Hồ",
    address: "12 Xuân Diệu",
    district: "Tây Hồ",
    city: "Hà Nội",
    isVerified: true,
    is24h: true,
    status: "AVAILABLE",
    specializations: ["DOG", "CAT"],
    rating: 4.6,
    reviewCount: 18,
    latitude: 21.0602,
    longitude: 105.8297,
  },
  {
    id: "far",
    name: "Saigon Pet Care",
    address: "Quận 1",
    district: "Quận 1",
    city: "Hồ Chí Minh",
    isVerified: true,
    is24h: false,
    status: "BUSY",
    specializations: ["DOG"],
    rating: 4.9,
    reviewCount: 220,
    latitude: 10.7769,
    longitude: 106.7009,
  },
  {
    id: "unverified",
    name: "Unverified clinic",
    address: "Next door",
    district: null,
    city: "Hà Nội",
    isVerified: false,
    is24h: true,
    status: "EMERGENCY",
    specializations: ["DOG"],
    rating: 5,
    reviewCount: 999,
    latitude: 21.0601,
    longitude: 105.8298,
  },
];

test("clinic discovery never exposes unverified records", () => {
  const result = discoverClinics(clinics, {});

  assert.deepEqual(
    result.map((clinic) => clinic.id),
    ["far", "near"],
  );
});

test("clinic discovery ranks by real distance and applies a radius", () => {
  const result = discoverClinics(clinics, {
    origin: { latitude: 21.0601, longitude: 105.8298 },
    radiusKm: 10,
    sort: "distance",
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "near");
  assert.equal(result[0]?.distanceKm, 0);
});

test("nearby discovery excludes clinics that have no verified coordinates", () => {
  const result = discoverClinics(
    [
      ...clinics,
      {
        ...clinics[0]!,
        id: "missing-coordinates",
        name: "No map position",
        latitude: null,
        longitude: null,
      },
    ],
    {
      origin: { latitude: 21.0601, longitude: 105.8298 },
      radiusKm: 10,
      sort: "distance",
    },
  );

  assert.deepEqual(result.map((clinic) => clinic.id), ["near"]);
});

test("clinic discovery matches Vietnamese text without requiring accents", () => {
  const result = discoverClinics(clinics, { query: "thu y tay ho" });

  assert.deepEqual(result.map((clinic) => clinic.id), ["near"]);
});

test("clinic discovery applies emergency and species filters together", () => {
  const result = discoverClinics(clinics, {
    is24h: true,
    statuses: ["AVAILABLE", "EMERGENCY"],
    species: "CAT",
  });

  assert.deepEqual(result.map((clinic) => clinic.id), ["near"]);
});
