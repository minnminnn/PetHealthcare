import { normalizeSearchText } from "./clinic-discovery";

const MAPBOX_SEARCH_BOX_FORWARD_URL =
  "https://api.mapbox.com/search/searchbox/v1/forward";
const VETERINARY_SEARCH_TERMS = ["veterinary", "thú y", "pet clinic"] as const;
const MAX_EXACT_MATCH_DISTANCE_KM = 5;

interface MapboxSearchBoxFeature {
  id?: string;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: {
    mapbox_id?: string;
    feature_type?: string;
    name?: string;
    name_preferred?: string;
    address?: string;
    full_address?: string;
    place_formatted?: string;
    poi_category?: unknown;
    distance?: unknown;
  };
}

interface MapboxSearchBoxResponse {
  features?: MapboxSearchBoxFeature[];
}

export interface MapboxClinicSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters: number | null;
  categories: string[];
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export type ClinicMapCenter = Coordinates & {
  source: "mapbox" | "database";
};

function distanceBetweenKm(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const aLatitude = toRadians(a.latitude);
  const bLatitude = toRadians(b.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(aLatitude) *
      Math.cos(bLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

export function selectClinicMapCenter({
  databaseCenter,
  searchResult,
}: {
  databaseCenter?: Coordinates | null;
  searchResult?: Coordinates | null;
}): ClinicMapCenter | null {
  if (
    searchResult &&
    (!databaseCenter ||
      distanceBetweenKm(databaseCenter, searchResult) <=
        MAX_EXACT_MATCH_DISTANCE_KM)
  ) {
    return { ...searchResult, source: "mapbox" };
  }
  return databaseCenter ? { ...databaseCenter, source: "database" } : null;
}

interface SearchBoxRequest {
  query: string;
  locale: "vi" | "en";
  proximity?: Coordinates;
  radiusKm?: number;
  accessToken: string;
  types: "poi" | "poi,address";
  limit: number;
  fetchImpl: typeof fetch;
}

function normalizeFeature(
  feature: MapboxSearchBoxFeature,
): MapboxClinicSearchResult | null {
  const coordinates = feature.geometry?.coordinates;
  const properties = feature.properties ?? {};
  const name = properties.name_preferred ?? properties.name;
  const id = properties.mapbox_id ?? feature.id;

  if (
    !id ||
    !name ||
    feature.geometry?.type !== "Point" ||
    !Array.isArray(coordinates) ||
    typeof coordinates[0] !== "number" ||
    typeof coordinates[1] !== "number"
  ) {
    return null;
  }

  const categories = Array.isArray(properties.poi_category)
    ? properties.poi_category.filter(
        (category): category is string => typeof category === "string",
      )
    : [];

  const formattedAddress = [properties.address, properties.place_formatted]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  return {
    id,
    name,
    address:
      (properties.full_address ?? formattedAddress) ||
      (properties.place_formatted ?? name),
    latitude: coordinates[1],
    longitude: coordinates[0],
    distanceMeters:
      typeof properties.distance === "number" ? properties.distance : null,
    categories,
  };
}

async function searchBoxForward({
  query,
  locale,
  proximity,
  radiusKm,
  accessToken,
  types,
  limit,
  fetchImpl,
}: SearchBoxRequest): Promise<MapboxClinicSearchResult[]> {
  const url = new URL(MAPBOX_SEARCH_BOX_FORWARD_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("country", "vn");
  url.searchParams.set("language", locale);
  url.searchParams.set("types", types);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 10)));
  url.searchParams.set("show_closed_pois", "false");

  if (proximity) {
    url.searchParams.set(
      "proximity",
      `${proximity.longitude},${proximity.latitude}`,
    );
  }
  if (proximity && radiusKm !== undefined) {
    url.searchParams.set(
      "radius",
      String(Math.min(Math.max(radiusKm / 111, 0.00001), 10)),
    );
  }

  const response = await fetchImpl(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Mapbox Search Box failed (${response.status})`);
  }

  const payload = (await response.json()) as MapboxSearchBoxResponse;
  return (payload.features ?? []).flatMap((feature) => {
    const normalized = normalizeFeature(feature);
    return normalized ? [normalized] : [];
  });
}

export interface SearchClinicPoiInput {
  name: string;
  address?: string | null;
  locale: "vi" | "en";
  proximity?: Coordinates;
  accessToken: string;
  fetchImpl?: typeof fetch;
}

export async function searchClinicPoi({
  name,
  address,
  locale,
  proximity,
  accessToken,
  fetchImpl = fetch,
}: SearchClinicPoiInput): Promise<MapboxClinicSearchResult | null> {
  const query = [name.trim(), address?.trim()].filter(Boolean).join(", ");
  if (!query) return null;

  const results = await searchBoxForward({
    query,
    locale,
    proximity,
    accessToken,
    types: "poi,address",
    limit: 5,
    fetchImpl,
  });
  const normalizedName = normalizeSearchText(name);
  return (
    results.find((result) => {
      const candidate = normalizeSearchText(result.name);
      return (
        candidate === normalizedName ||
        candidate.includes(normalizedName) ||
        normalizedName.includes(candidate)
      );
    }) ??
    results[0] ??
    null
  );
}

export interface SearchNearbyVeterinaryClinicsInput {
  center: Coordinates;
  locale: "vi" | "en";
  radiusKm?: number;
  accessToken: string;
  fetchImpl?: typeof fetch;
}

export async function searchNearbyVeterinaryClinics({
  center,
  locale,
  radiusKm = 10,
  accessToken,
  fetchImpl = fetch,
}: SearchNearbyVeterinaryClinicsInput): Promise<MapboxClinicSearchResult[]> {
  const resultGroups = await Promise.all(
    VETERINARY_SEARCH_TERMS.map((query) =>
      searchBoxForward({
        query,
        locale,
        proximity: center,
        radiusKm,
        accessToken,
        types: "poi",
        limit: 10,
        fetchImpl,
      }),
    ),
  );

  const uniqueResults = new Map<string, MapboxClinicSearchResult>();
  for (const result of resultGroups.flat()) {
    const current = uniqueResults.get(result.id);
    if (
      !current ||
      (result.distanceMeters !== null &&
        (current.distanceMeters === null ||
          result.distanceMeters < current.distanceMeters))
    ) {
      uniqueResults.set(result.id, result);
    }
  }

  return Array.from(uniqueResults.values()).sort(
    (a, b) =>
      (a.distanceMeters ?? Number.POSITIVE_INFINITY) -
      (b.distanceMeters ?? Number.POSITIVE_INFINITY),
  );
}
