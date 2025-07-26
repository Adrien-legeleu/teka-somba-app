'use client';
import { GoogleMap, Circle, useLoadScript } from '@react-google-maps/api';
import { useEffect, useMemo } from 'react';

type SellerMapProps = {
  lat: number;
  lng: number;
  radius?: number; // en mètres
};

export default function SellerMap({ lat, lng, radius = 300 }: SellerMapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  });

  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  if (!isLoaded) {
    return (
      <div className="text-gray-400 text-sm">Chargement de la carte...</div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '300px',
        borderRadius: '1rem',
      }}
      center={center}
      zoom={14}
      options={{
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
      }}
    >
      <Circle
        center={center}
        radius={radius}
        options={{
          fillColor: '#f97316',
          fillOpacity: 0.25,
          strokeColor: '#f97316',
          strokeOpacity: 0.6,
          strokeWeight: 2,
        }}
      />
    </GoogleMap>
  );
}
