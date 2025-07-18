'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useRef } from 'react';
import type { Marker as LeafletMarker, LeafletMouseEvent } from 'leaflet';

type MapSelectProps = {
  lat: number | null;
  lng: number | null;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  city: string;
};

export default function MapSelect({
  lat,
  lng,
  setLat,
  setLng,
  city,
}: MapSelectProps) {
  // Centrage par défaut sur Kinshasa si rien
  const cityPos: Record<string, [number, number]> = {
    Kinshasa: [-4.325, 15.322],
    Brazzaville: [-4.2634, 15.2429],
    'Pointe-Noire': [-4.7692, 11.8661],
    Abidjan: [5.336, -4.026],
  };
  const center: [number, number] = cityPos[city] || [-4.325, 15.322];

  function DraggableMarker() {
    const markerRef = useRef<LeafletMarker | null>(null);

    useMapEvents({
      click(e: LeafletMouseEvent) {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
      },
    });

    if (lat === null || lng === null) return null;

    return (
      <Marker
        draggable={true}
        position={[lat, lng]}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target as LeafletMarker;
            const pos = marker.getLatLng();
            setLat(pos.lat);
            setLng(pos.lng);
          },
        }}
        ref={markerRef}
      />
    );
  }

  return (
    <div className="w-full h-60 rounded-lg overflow-hidden my-2 border">
      <MapContainer
        center={[
          lat !== null ? lat : center[0],
          lng !== null ? lng : center[1],
        ]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lat !== null && lng !== null && <DraggableMarker />}
      </MapContainer>
    </div>
  );
}
