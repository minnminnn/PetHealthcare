const MAPBOX_GEOCODING_URL =
  "https://api.mapbox.com/search/geocode/v6/forward";

interface MapboxFeature {
  id: string;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: {
    feature_type?: string;
    name?: string;
    name_preferred?: string;
    full_address?: string;
    place_formatted?: string;
  };
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

export interface LocationSuggestion {
  id: string;
  label: string;
  address: string;
  featureType: string;
  latitude: number;
  longitude: number;
}

export interface SuggestLocationsInput {
  query: string;
  locale: "vi" | "en";
  proximity?: { latitude: number; longitude: number };
  accessToken: string;
  limit?: number;
  fetchImpl?: typeof fetch;
}

export async function suggestLocations({
  query,
  locale,
  proximity,
  accessToken,
  limit = 5,
  fetchImpl = fetch,
}: SuggestLocationsInput): Promise<LocationSuggestion[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const url = new URL(MAPBOX_GEOCODING_URL);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("country", "vn");
  url.searchParams.set("language", locale);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set(
    "types",
    "address,street,place,locality,neighborhood,district",
  );
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 10)));
  if (proximity) {
    url.searchParams.set(
      "proximity",
      `${proximity.longitude},${proximity.latitude}`,
    );
  }

  const response = await fetchImpl(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Mapbox geocoding failed (${response.status})`);
  }

  const payload = (await response.json()) as MapboxResponse;
  return (payload.features ?? []).flatMap((feature) => {
    const coordinates = feature.geometry?.coordinates;
    if (
      feature.geometry?.type !== "Point" ||
      !Array.isArray(coordinates) ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      return [];
    }

    const properties = feature.properties ?? {};
    const label = properties.name_preferred ?? properties.name;
    if (!label) return [];

    return [
      {
        id: feature.id,
        label,
        address:
          properties.full_address ??
          [label, properties.place_formatted].filter(Boolean).join(", "),
        featureType: properties.feature_type ?? "place",
        latitude: coordinates[1],
        longitude: coordinates[0],
      },
    ];
  });
}
