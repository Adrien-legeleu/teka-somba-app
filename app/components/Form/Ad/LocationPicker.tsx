'use client';
import { useState, useEffect } from 'react';

type LocationPickerProps = {
  location: string;
  setLocation: (val: string) => void;
  lat: number | null;
  setLat: (val: number) => void;
  lng: number | null;
  setLng: (val: number) => void;
};

export default function LocationPicker({
  location,
  setLocation,
  lat,
  setLat,
  lng,
  setLng,
}: LocationPickerProps) {
  const [search, setSearch] = useState(location || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    setSearch(location);
  }, [location]);

  async function handleSearch(q: string) {
    setSearch(q);
    if (!q) return setSuggestions([]);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&autocomplete=true&language=fr`
    );
    const data = await res.json();
    setSuggestions(data.features || []);
  }

  return (
    <div>
      <label>Localisation</label>
      <input
        className="input-class"
        placeholder="Adresse, ville…"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="border bg-white max-h-48 overflow-auto">
          {suggestions.map((place) => (
            <li
              key={place.id}
              className="cursor-pointer px-2 py-1 hover:bg-gray-100"
              onClick={() => {
                setLocation(place.place_name);
                setLat(place.center[1]);
                setLng(place.center[0]);
                setSearch(place.place_name);
                setSuggestions([]);
              }}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
