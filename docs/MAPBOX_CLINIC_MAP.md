# Mapbox clinic map

The clinic finder uses native Mapbox GL JS. It does not use Leaflet, `react-leaflet`, or `react-map-gl`.

## Package

```bash
npm install mapbox-gl
```

`mapbox-gl` includes its own TypeScript declarations. Its stylesheet is imported before the application stylesheet in `app/[locale]/layout.tsx` so PetCare's marker, popup, and control styles can override the Mapbox defaults.

## Access tokens

Add these values to `.env`:

```dotenv
# Public browser token. Use a pk.* token and restrict it to the deployed URLs.
NEXT_PUBLIC_MAPBOX_TOKEN=pk.example

# Optional server token for Search Box and Geocoding requests.
# When absent, the server falls back to NEXT_PUBLIC_MAPBOX_TOKEN.
MAPBOX_ACCESS_TOKEN=pk.example
```

The browser token renders the map and requests a route when a user presses **Get directions**. Clinic and address searches are proxied through tRPC, so server behavior and returned fields stay consistent.

## Mapbox APIs

- Exact clinic and nearby POI search: `GET https://api.mapbox.com/search/searchbox/v1/forward`
  - Exact lookup uses the clinic name and address with `types=poi,address`.
  - Nearby lookup searches `veterinary`, `thú y`, and `pet clinic` with `types=poi`, `country=vn`, `proximity=longitude,latitude`, and a bounded `radius`.
- Address autocomplete fallback: `GET https://api.mapbox.com/search/geocode/v6/forward`
- Driving route displayed on the map: `GET https://api.mapbox.com/directions/v5/mapbox/driving/{origin};{destination}`

Search Box suggestions are treated as temporary results. They are normalized and returned for the current request, not written to the database. Verified clinic records remain the application's source of truth; a Search Box exact match only replaces a stored map center when it is within 5 km of that verified center.

## User flow

1. Selecting a verified clinic calls `clinics.mapData`.
2. The server searches for the exact clinic and rejects implausibly distant matches.
3. The server performs the three nearby veterinary POI searches and deduplicates results by Mapbox ID.
4. Mapbox GL smoothly flies to the selected center and renders selected, verified, and nearby marker tiers.
5. Every marker opens a safe DOM-based popup with the clinic name, address, and route action.
6. `GeolocateControl` shows the user's position. The route action uses that location and draws the Directions API result directly on the map.

## Relevant files

- `components/clinics/ClinicMap.tsx` — Mapbox GL lifecycle, controls, markers, popups, loading/error states, and directions
- `server/services/mapbox-search.ts` — Search Box requests, normalization, deduplication, and exact-match safeguards
- `server/api/routers/clinics.ts` — tRPC map endpoint
- `styles/globals.css` — map marker and popup presentation

Official references:

- [Mapbox GL JS with npm](https://docs.mapbox.com/mapbox-gl-js/guides/get-started/use-with-npm/)
- [Search Box API](https://docs.mapbox.com/api/search/search-box/)
- [POI search in React](https://docs.mapbox.com/help/tutorials/poi-search-react/)
- [Directions API](https://docs.mapbox.com/api/navigation/directions/)
