"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

interface MapClinic {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface ClinicMapProps {
  clinics: MapClinic[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const VIETNAM_CENTER: [number, number] = [16.0471, 108.2062];

function RecenterMap({ clinic }: { clinic?: MapClinic }) {
  const map = useMap();

  useEffect(() => {
    if (
      clinic &&
      clinic.latitude !== null &&
      clinic.longitude !== null
    ) {
      map.flyTo([clinic.latitude, clinic.longitude], 14, { duration: 0.7 });
    }
  }, [clinic, map]);

  return null;
}

export function ClinicMap({ clinics, selectedId, onSelect }: ClinicMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mappedClinics = clinics.filter(
    (clinic) => clinic.latitude !== null && clinic.longitude !== null,
  );
  const selectedClinic =
    mappedClinics.find((clinic) => clinic.id === selectedId) ?? mappedClinics[0];
  const center: [number, number] = selectedClinic
    ? [selectedClinic.latitude!, selectedClinic.longitude!]
    : VIETNAM_CENTER;

  if (!token) {
    return (
      <div className="grid min-h-[23rem] place-items-center bg-[#20211f] px-8 text-center text-sm leading-6 text-[#c9cac3]">
        Mapbox is not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to display the map.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={selectedClinic ? 13 : 5}
      scrollWheelZoom={false}
      className="h-[23rem] w-full bg-[#20211f]"
      attributionControl
    >
      <TileLayer
        attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`}
        tileSize={512}
        zoomOffset={-1}
      />
      {mappedClinics.map((clinic) => {
        const selected = clinic.id === selectedClinic?.id;
        return (
          <CircleMarker
            key={clinic.id}
            center={[clinic.latitude!, clinic.longitude!]}
            radius={selected ? 10 : 7}
            pathOptions={{
              color: selected ? "#f8f8f5" : "#7b302a",
              fillColor: "#d85f53",
              fillOpacity: 1,
              weight: selected ? 3 : 2,
            }}
            eventHandlers={{ click: () => onSelect(clinic.id) }}
          >
            <Popup>
              <strong>{clinic.name}</strong>
              <br />
              {clinic.address}
            </Popup>
          </CircleMarker>
        );
      })}
      <RecenterMap clinic={selectedClinic} />
    </MapContainer>
  );
}
