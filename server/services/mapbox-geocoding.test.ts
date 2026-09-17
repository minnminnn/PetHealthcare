import assert from "node:assert/strict";
import test from "node:test";

import { suggestLocations } from "./mapbox-geocoding";

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
    new Response(JSON.stringify({ message: "Not Authorized" }), { status: 401 });

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
