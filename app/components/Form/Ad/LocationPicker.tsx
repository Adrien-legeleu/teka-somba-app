'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';

type LocationPickerProps = {
  location: string;
  setLocation: (val: string) => void;
  lat: number | null;
  setLat: (val: number) => void;
  lng: number | null;
  setLng: (val: number) => void;
};

// Type pour les suggestions Mapbox
type MapboxFeature = {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
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
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);

  useEffect(() => {
    setSearch(location);
  }, [location]);

  async function handleSearch(q: string) {
    setSearch(q);
    if (!q.trim()) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&autocomplete=true&language=fr`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      setSuggestions([]);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Localisation</Label>
      <Input
        id="location"
        placeholder="Adresse, ville, quartier…"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-2xl"
      />
      {suggestions.length > 0 && (
        <Command className="rounded-xl border shadow-md max-h-60 overflow-auto bg-white mt-1 animate-in fade-in slide-in-from-top-2">
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {suggestions.map((place) => (
                <CommandItem
                  key={place.id}
                  className="cursor-pointer text-sm px-2 py-1"
                  onSelect={() => {
                    setLocation(place.place_name);
                    setLat(place.center[1]);
                    setLng(place.center[0]);
                    setSearch(place.place_name);
                    setSuggestions([]);
                  }}
                >
                  {place.place_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  );
}
