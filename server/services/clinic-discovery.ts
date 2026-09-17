export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DiscoverableClinic {
  id: string;
  name: string;
  address: string;
  district: string | null;
  city: string;
  isVerified: boolean;
  is24h: boolean;
  status: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  latitude: number | null;
  longitude: number | null;
}

export interface ClinicDiscoveryOptions {
  query?: string;
  origin?: Coordinates;
  radiusKm?: number;
  is24h?: boolean;
  species?: string;
  statuses?: string[];
  sort?: "distance" | "rating";
  limit?: number;
}

export type DiscoveredClinic<T extends DiscoverableClinic> = T & {
  distanceKm: number | null;
};

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .trim();
}

export function distanceBetweenKm(a: Coordinates, b: Coordinates) {
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

export function discoverClinics<T extends DiscoverableClinic>(
  clinics: readonly T[],
  options: ClinicDiscoveryOptions,
): Array<DiscoveredClinic<T>> {
  const normalizedQuery = options.query
    ? normalizeSearchText(options.query)
    : "";
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  const discovered = clinics
    .filter((clinic) => clinic.isVerified)
    .filter((clinic) => options.is24h === undefined || clinic.is24h === options.is24h)
    .filter(
      (clinic) =>
        !options.species || clinic.specializations.includes(options.species),
    )
    .filter(
      (clinic) =>
        !options.statuses?.length || options.statuses.includes(clinic.status),
    )
    .map((clinic) => {
      const distanceKm =
        options.origin &&
        clinic.latitude !== null &&
        clinic.longitude !== null
          ? distanceBetweenKm(options.origin, {
              latitude: clinic.latitude,
              longitude: clinic.longitude,
            })
          : null;

      return { ...clinic, distanceKm };
    })
    .filter((clinic) => {
      if (!terms.length) return true;
      const searchable = normalizeSearchText(
        [clinic.name, clinic.address, clinic.district, clinic.city]
          .filter(Boolean)
          .join(" "),
      );
      return terms.every((term) => searchable.includes(term));
    })
    .filter(
      (clinic) =>
        options.radiusKm === undefined ||
        (clinic.distanceKm !== null && clinic.distanceKm <= options.radiusKm),
    );

  discovered.sort((a, b) => {
    if (options.sort === "distance" && options.origin) {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    }

    if (a.rating !== b.rating) return b.rating - a.rating;
    if (a.reviewCount !== b.reviewCount) return b.reviewCount - a.reviewCount;
    return a.name.localeCompare(b.name);
  });

  return discovered.slice(0, options.limit ?? 20).map((clinic) => ({
    ...clinic,
    distanceKm:
      clinic.distanceKm === null
        ? null
        : Math.round(clinic.distanceKm * 10) / 10,
  }));
}
