import assert from "node:assert/strict";
import test from "node:test";

import { suggestLocations } from "./mapbox-geocoding";
import * as mapboxSearch from "./mapbox-search";

test("Mapbox location suggestions constrain results to Vietnam and user proximity", async () => {
  let requestedUrl = "";
  const fetchImpl: typeof fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            id: "address.123",
            type: "Feature",
            geometry: { type: "Point", coordinates: [105.8297, 21.0602] },
            properties: {
              feature_type: "address",
              name: "12 Xuân Diệu",
              full_address: "12 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const result = await suggestLocations({
    query: "12 xuan dieu",
    locale: "vi",
    proximity: { latitude: 21.03, longitude: 105.85 },
    accessToken: "test-token",
    fetchImpl,
  });

  const url = new URL(requestedUrl);
  assert.equal(url.hostname, "api.mapbox.com");
  assert.equal(url.pathname, "/search/geocode/v6/forward");
  assert.equal(url.searchParams.get("country"), "vn");
  assert.equal(url.searchParams.get("proximity"), "105.85,21.03");
  assert.equal(url.searchParams.get("access_token"), "test-token");
  assert.deepEqual(result, [
    {
      id: "address.123",
      label: "12 Xuân Diệu",
      address: "12 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
      featureType: "address",
      latitude: 21.0602,
      longitude: 105.8297,
    },
  ]);
});

test("Mapbox errors do not get disguised as empty suggestions", async () => {
  const fetchImpl: typeof fetch = async () =>
    new Response(JSON.stringify({ message: "Not Authorized" }), {
      status: 401,
    });

  await assert.rejects(
    suggestLocations({
      query: "hanoi",
      locale: "en",
      accessToken: "bad-token",
      fetchImpl,
    }),
    /Mapbox geocoding failed \(401\)/,
  );
});

test("exact clinic search uses Search Box POIs and normalizes the clinic details", async () => {
  const searchClinicPoi = Reflect.get(mapboxSearch, "searchClinicPoi");
  assert.equal(typeof searchClinicPoi, "function");

  let requestedUrl = "";
  const fetchImpl: typeof fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            id: "address.xuan-dieu",
            type: "Feature",
            geometry: { type: "Point", coordinates: [105.82, 21.05] },
            properties: {
              mapbox_id: "address-result",
              feature_type: "address",
              name: "12 Xuân Diệu",
              full_address: "12 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
            },
          },
          {
            id: "poi.pet-care-hanoi",
            type: "Feature",
            geometry: { type: "Point", coordinates: [105.8297, 21.0602] },
            properties: {
              mapbox_id: "dXJuOm1ieHBvaTo1MjM0",
              feature_type: "poi",
              name: "Shop Thú Y A",
              full_address: "12 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
              poi_category: ["veterinary", "pet clinic"],
              distance: 140,
            },
          },
        ],
        attribution: "© Mapbox",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const result = await searchClinicPoi({
    name: "Shop Thú Y A",
    address: "12 Xuân Diệu, Tây Hồ, Hà Nội",
    locale: "vi",
    proximity: { latitude: 21.06, longitude: 105.83 },
    accessToken: "test-token",
    fetchImpl,
  });

  const url = new URL(requestedUrl);
  assert.equal(url.pathname, "/search/searchbox/v1/forward");
  assert.equal(
    url.searchParams.get("q"),
    "Shop Thú Y A, 12 Xuân Diệu, Tây Hồ, Hà Nội",
  );
  assert.equal(url.searchParams.get("country"), "vn");
  assert.equal(url.searchParams.get("types"), "poi,address");
  assert.equal(url.searchParams.get("proximity"), "105.83,21.06");
  assert.deepEqual(result, {
    id: "dXJuOm1ieHBvaTo1MjM0",
    name: "Shop Thú Y A",
    address: "12 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
    latitude: 21.0602,
    longitude: 105.8297,
    distanceMeters: 140,
    categories: ["veterinary", "pet clinic"],
  });
});

test("nearby clinic search covers all requested veterinary keywords and removes duplicate POIs", async () => {
  const searchNearbyVeterinaryClinics = Reflect.get(
    mapboxSearch,
    "searchNearbyVeterinaryClinics",
  );
  assert.equal(typeof searchNearbyVeterinaryClinics, "function");

  const requestedUrls: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    const requestedUrl = String(input);
    requestedUrls.push(requestedUrl);
    const query = new URL(requestedUrl).searchParams.get("q");
    const features =
      query === "veterinary"
        ? [
            {
              id: "poi.shared",
              type: "Feature",
              geometry: { type: "Point", coordinates: [105.83, 21.061] },
              properties: {
                mapbox_id: "shared-id",
                feature_type: "poi",
                name: "West Lake Veterinary Clinic",
                full_address: "14 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
                poi_category: ["veterinary"],
                distance: 180,
              },
            },
          ]
        : query === "thú y"
          ? [
              {
                id: "poi.shared",
                type: "Feature",
                geometry: { type: "Point", coordinates: [105.83, 21.061] },
                properties: {
                  mapbox_id: "shared-id",
                  feature_type: "poi",
                  name: "West Lake Veterinary Clinic",
                  full_address: "14 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
                  poi_category: ["veterinary"],
                  distance: 180,
                },
              },
              {
                id: "poi.second",
                type: "Feature",
                geometry: { type: "Point", coordinates: [105.84, 21.065] },
                properties: {
                  mapbox_id: "second-id",
                  feature_type: "poi",
                  name: "Phòng khám Thú y Hồ Tây",
                  place_formatted: "Tây Hồ, Hà Nội, Việt Nam",
                  poi_category: ["pet clinic"],
                  distance: 940,
                },
              },
            ]
          : [];

    return new Response(
      JSON.stringify({
        type: "FeatureCollection",
        features,
        attribution: "© Mapbox",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const results = await searchNearbyVeterinaryClinics({
    center: { latitude: 21.06, longitude: 105.83 },
    locale: "vi",
    radiusKm: 8,
    accessToken: "test-token",
    fetchImpl,
  });

  assert.deepEqual(
    requestedUrls.map((value) => new URL(value).searchParams.get("q")),
    ["veterinary", "thú y", "pet clinic"],
  );
  for (const requestedUrl of requestedUrls) {
    const url = new URL(requestedUrl);
    assert.equal(url.pathname, "/search/searchbox/v1/forward");
    assert.equal(url.searchParams.get("country"), "vn");
    assert.equal(url.searchParams.get("types"), "poi");
    assert.equal(url.searchParams.get("proximity"), "105.83,21.06");
    assert.equal(url.searchParams.get("show_closed_pois"), "false");
    assert.equal(url.searchParams.get("radius"), String(8 / 111));
  }
  assert.deepEqual(
    results.map(({ id, name, address, distanceMeters }) => ({
      id,
      name,
      address,
      distanceMeters,
    })),
    [
      {
        id: "shared-id",
        name: "West Lake Veterinary Clinic",
        address: "14 Xuân Diệu, Tây Hồ, Hà Nội, Việt Nam",
        distanceMeters: 180,
      },
      {
        id: "second-id",
        name: "Phòng khám Thú y Hồ Tây",
        address: "Tây Hồ, Hà Nội, Việt Nam",
        distanceMeters: 940,
      },
    ],
  );
});

test("clinic map center accepts a nearby exact match but rejects a distant false match", () => {
  const selectClinicMapCenter = Reflect.get(
    mapboxSearch,
    "selectClinicMapCenter",
  );
  assert.equal(typeof selectClinicMapCenter, "function");

  const databaseCenter = { latitude: 21.06, longitude: 105.83 };
  assert.deepEqual(
    selectClinicMapCenter({
      databaseCenter,
      searchResult: { latitude: 21.061, longitude: 105.831 },
    }),
    { latitude: 21.061, longitude: 105.831, source: "mapbox" },
  );
  assert.deepEqual(
    selectClinicMapCenter({
      databaseCenter,
      searchResult: { latitude: 10.7769, longitude: 106.7009 },
    }),
    { latitude: 21.06, longitude: 105.83, source: "database" },
  );
});
