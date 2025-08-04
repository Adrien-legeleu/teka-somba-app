'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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

type MapboxFeature = {
  id: string;
  place_name: string;
  center: [number, number];
};

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void | Promise<void>,
  delay: number
) {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Args) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        void callback(...args); // ignore le résultat async
      }, delay);
    },
    [callback, delay]
  );
}

export default function LocationPicker({
  location,
  setLocation,

  setLat,

  setLng,
}: LocationPickerProps) {
  const [search, setSearch] = useState(location || '');
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);

  useEffect(() => {
    setSearch(location);
  }, [location]);

  // La vraie fonction qui fait le fetch
  const fetchSuggestions = useCallback(async (q: string) => {
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
  }, []);

  // Debounced version pour le input
  const debouncedFetch = useDebouncedCallback(fetchSuggestions, 350);

  function handleChange(q: string) {
    setSearch(q);
    debouncedFetch(q); // Limite les appels API Mapbox à 1 tous les 350ms
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Localisation</Label>
      <Input
        id="location"
        placeholder="Adresse, ville, quartier…"
        value={search}
        onChange={(e) => handleChange(e.target.value)}
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
