"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, {
  type GeoJSONSource,
  type LngLatLike,
  type Map as MapboxMap,
  type Marker,
} from "mapbox-gl";
import { Loader2, MapPin, TriangleAlert } from "lucide-react";
import { api } from "@/trpc/react";
import { getCurrentLocation, getLocationErrorMessage } from "@/lib/geolocation";

export interface MapViewportState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface MapClinic {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MapSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters: number | null;
  categories: string[];
}

interface ClinicMapProps {
  clinics: MapClinic[];
  selectedId?: string;
  locale: "vi" | "en";
  onSelect: (id: string) => void;
  onViewportChange?: (viewport: MapViewportState) => void;
}

interface DirectionsResponse {
  routes?: Array<{
    geometry?: {
      type?: "LineString";
      coordinates?: Array<[number, number]>;
    };
  }>;
}

interface GeolocateEvent {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const VIETNAM_CENTER: [number, number] = [108.2062, 16.0471];
const ROUTE_SOURCE_ID = "clinic-route";
const ROUTE_LAYER_ID = "clinic-route-line";

const COPY = {
  vi: {
    selected: "Phòng khám đã chọn",
    verified: "Phòng khám đã xác minh",
    nearby: "Gợi ý lân cận từ Mapbox",
    directions: "Chỉ đường",
    loadingMap: "Đang tải bản đồ…",
    searching: "Đang tìm phòng khám lân cận…",
    searchError:
      "Không thể tải gợi ý lân cận. Các phòng khám đã xác minh vẫn hiển thị.",
    mapError: "Không thể tải bản đồ Mapbox lúc này.",
    tokenError: "Thiếu NEXT_PUBLIC_MAPBOX_TOKEN để hiển thị bản đồ.",
    directionsError:
      "Không thể tạo tuyến đường. Hãy kiểm tra quyền vị trí rồi thử lại.",
  },
  en: {
    selected: "Selected clinic",
    verified: "Verified clinic",
    nearby: "Nearby Mapbox suggestion",
    directions: "Get directions",
    loadingMap: "Loading map…",
    searching: "Finding nearby veterinary clinics…",
    searchError:
      "Nearby suggestions are unavailable. Verified clinics are still shown.",
    mapError: "The Mapbox map could not be loaded right now.",
    tokenError: "Add NEXT_PUBLIC_MAPBOX_TOKEN to display the map.",
    directionsError:
      "A route could not be created. Check location access and try again.",
  },
} as const;

function hasCoordinates(
  clinic: MapClinic,
): clinic is MapClinic & { latitude: number; longitude: number } {
  return clinic.latitude !== null && clinic.longitude !== null;
}

function createMarkerElement(
  kind: "selected" | "verified" | "nearby",
  label: string,
) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `clinic-map-marker clinic-map-marker--${kind}`;
  element.setAttribute("aria-label", label);
  element.title = label;

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = kind === "selected" ? "✚" : "•";
  element.append(icon);
  return element;
}

function createPopupContent({
  name,
  address,
  eyebrow,
  directionsLabel,
  onDirections,
}: {
  name: string;
  address: string;
  eyebrow: string;
  directionsLabel: string;
  onDirections: () => void;
}) {
  const root = document.createElement("div");
  root.className = "clinic-map-popup-content";

  const label = document.createElement("p");
  label.className = "clinic-map-popup-eyebrow";
  label.textContent = eyebrow;

  const title = document.createElement("h3");
  title.className = "clinic-map-popup-title";
  title.textContent = name;

  const body = document.createElement("p");
  body.className = "clinic-map-popup-address";
  body.textContent = address;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "clinic-map-popup-directions";
  button.textContent = directionsLabel;
  button.addEventListener("click", onDirections);

  root.append(label, title, body, button);
  return root;
}

function removeRoute(map: MapboxMap) {
  if (!map.isStyleLoaded()) return;
  if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
  if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
}

export function ClinicMap({
  clinics,
  selectedId,
  locale,
  onSelect,
  onViewportChange,
}: ClinicMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const copy = COPY[locale];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const onViewportChangeRef = useRef(onViewportChange);
  const userLocationRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [directionsError, setDirectionsError] = useState("");

  const mappedClinics = useMemo(
    () => clinics.filter(hasCoordinates),
    [clinics],
  );
  const selectedDatabaseClinic =
    mappedClinics.find((clinic) => clinic.id === selectedId) ??
    mappedClinics[0];
  onViewportChangeRef.current = onViewportChange;

  const mapDataQuery = api.clinics.mapData.useQuery(
    { clinicId: selectedId ?? "", locale, radiusKm: 8 },
    { enabled: Boolean(selectedId), retry: false, staleTime: 0, gcTime: 0 },
  );

  const selectedClinic = mapDataQuery.data?.selected ?? selectedDatabaseClinic;
  const nearbyClinics = useMemo(
    () => mapDataQuery.data?.nearby ?? [],
    [mapDataQuery.data?.nearby],
  );

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;

    const initialCenter: LngLatLike = selectedDatabaseClinic
      ? [selectedDatabaseClinic.longitude, selectedDatabaseClinic.latitude]
      : VIETNAM_CENTER;
    const map = new mapboxgl.Map({
      accessToken: token,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: initialCenter,
      zoom: selectedDatabaseClinic ? 13 : 5,
      attributionControl: true,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
    });
    geolocate.on("geolocate", (event: GeolocateEvent) => {
      userLocationRef.current = {
        latitude: event.coords.latitude,
        longitude: event.coords.longitude,
      };
    });
    geolocate.on("error", () => {
      setDirectionsError(getLocationErrorMessage(new Error(), locale));
    });
    map.addControl(geolocate, "top-right");

    const reportViewport = () => {
      if (!onViewportChangeRef.current) return;
      const center = map.getCenter();
      onViewportChangeRef.current({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });
    };
    map.on("moveend", reportViewport);
    map.on("load", () => {
      setMapReady(true);
      reportViewport();
    });
    map.on("error", (event) => {
      console.error("Mapbox GL map error", event.error);
      setMapError(copy.mapError);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // The map owns an imperative WebGL lifecycle and is initialized once per token.
    // Clinic selection changes are handled by the flyTo effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedClinic) return;

    setDirectionsError("");
    removeRoute(map);
    map.flyTo({
      center: [selectedClinic.longitude, selectedClinic.latitude],
      zoom: 14,
      duration: 1100,
      essential: false,
    });
  }, [mapReady, selectedClinic]);

  const requestDirections = useCallback(
    async (destination: { latitude: number; longitude: number }) => {
      const map = mapRef.current;
      if (!map || !token) return;

      try {
        setDirectionsError("");
        const origin: { latitude: number; longitude: number } =
          userLocationRef.current ??
          (await getCurrentLocation().then(({ lat, lng }) => ({
            latitude: lat,
            longitude: lng,
          })));
        userLocationRef.current = origin;

        const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
        const url = new URL(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`,
        );
        url.searchParams.set("access_token", token);
        url.searchParams.set("geometries", "geojson");
        url.searchParams.set("overview", "full");
        url.searchParams.set("steps", "false");

        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok)
          throw new Error(`Directions failed (${response.status})`);
        const payload = (await response.json()) as DirectionsResponse;
        const routeCoordinates = payload.routes?.[0]?.geometry?.coordinates;
        if (!routeCoordinates?.length)
          throw new Error("Directions returned no route");

        const route = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: routeCoordinates,
          },
        };
        const source = map.getSource(ROUTE_SOURCE_ID) as
          GeoJSONSource | undefined;
        if (source) {
          source.setData(route);
        } else {
          map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: route });
          map.addLayer({
            id: ROUTE_LAYER_ID,
            type: "line",
            source: ROUTE_SOURCE_ID,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#d85f53",
              "line-width": 5,
              "line-opacity": 0.9,
            },
          });
        }

        const bounds = routeCoordinates.reduce(
          (currentBounds, coordinate) => currentBounds.extend(coordinate),
          new mapboxgl.LngLatBounds(routeCoordinates[0], routeCoordinates[0]),
        );
        map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 900 });
      } catch (error) {
        console.error("Mapbox directions request failed", error);
        setDirectionsError(
          error instanceof Error && error.name === "LocationError"
            ? getLocationErrorMessage(error, locale)
            : copy.directionsError,
        );
      }
    },
    [copy.directionsError, locale, token],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const addMarker = ({
      id,
      name,
      address,
      latitude,
      longitude,
      kind,
      onClick,
    }: {
      id: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      kind: "selected" | "verified" | "nearby";
      onClick?: () => void;
    }) => {
      const eyebrow =
        kind === "selected"
          ? copy.selected
          : kind === "nearby"
            ? copy.nearby
            : copy.verified;
      const element = createMarkerElement(kind, `${eyebrow}: ${name}`);
      if (onClick) element.addEventListener("click", onClick);

      const popup = new mapboxgl.Popup({
        offset: kind === "selected" ? 28 : 22,
        closeButton: true,
        className: "petcare-map-popup",
      }).setDOMContent(
        createPopupContent({
          name,
          address,
          eyebrow,
          directionsLabel: copy.directions,
          onDirections: () => void requestDirections({ latitude, longitude }),
        }),
      );
      const marker = new mapboxgl.Marker({ element, anchor: "bottom" })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);
      marker.getElement().dataset.markerId = id;
      markersRef.current.push(marker);
    };

    for (const clinic of mappedClinics) {
      if (clinic.id === selectedClinic?.id) continue;
      addMarker({
        ...clinic,
        kind: "verified",
        onClick: () => onSelect(clinic.id),
      });
    }

    for (const clinic of nearbyClinics) {
      addMarker({ ...clinic, kind: "nearby" });
    }

    if (selectedClinic) {
      addMarker({
        ...selectedClinic,
        kind: "selected",
        onClick: () => onSelect(selectedClinic.id),
      });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [
    copy.directions,
    copy.nearby,
    copy.selected,
    copy.verified,
    mapReady,
    mappedClinics,
    nearbyClinics,
    onSelect,
    requestDirections,
    selectedClinic,
  ]);

  if (!token) {
    return (
      <div className="grid min-h-[23rem] place-items-center bg-[#20211f] px-8 text-center text-sm leading-6 text-[#c9cac3]">
        <div className="max-w-xs">
          <TriangleAlert className="mx-auto mb-3 h-6 w-6 text-[#ef7569]" />
          {copy.tokenError}
        </div>
      </div>
    );
  }

  const searchFailed = Boolean(
    mapDataQuery.error || mapDataQuery.data?.warning,
  );

  return (
    <div className="relative min-h-[23rem] w-full bg-[#20211f]">
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        aria-label="Clinic map"
      />

      {!mapReady && !mapError && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#20211f] text-sm text-[#d6d7d0]">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#ef7569]" />
            {copy.loadingMap}
          </span>
        </div>
      )}

      {mapDataQuery.isFetching && mapReady && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#20211f]/90 px-3 py-2 text-xs font-semibold text-[#f1f1ed] shadow-lg backdrop-blur">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ef7569]" />
          {copy.searching}
        </div>
      )}

      {(mapError || searchFailed || directionsError) && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-start gap-2 rounded-xl border border-[#ef7569]/30 bg-[#241b19]/95 px-3 py-2.5 text-xs leading-5 text-[#f3c0ba] shadow-lg backdrop-blur">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ef7569]" />
          <span>{mapError || directionsError || copy.searchError}</span>
        </div>
      )}

      {mapReady &&
        !mapDataQuery.isFetching &&
        !searchFailed &&
        nearbyClinics.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#20211f]/90 px-3 py-2 text-[11px] font-semibold text-[#e7e7e2] shadow-lg backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-[#ef7569]" />
            {nearbyClinics.length} {copy.nearby.toLocaleLowerCase(locale)}
          </div>
        )}
    </div>
  );
}
