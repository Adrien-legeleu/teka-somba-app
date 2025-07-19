// CityPicker.tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';

export function CityPicker({
  city,
  setCity,
}: {
  city: string;
  setCity: (val: string) => void;
}) {
  const [search, setSearch] = useState(city || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  async function handleSearch(q: string) {
    setSearch(q);

    // 🔁 Si l'utilisateur efface ou modifie manuellement → ville invalide → reset
    if (q !== city) {
      setCity(''); // 🔥 invalide la ville sélectionnée
    }

    if (!q.trim()) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&autocomplete=true&language=fr&types=place`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch {
      setSuggestions([]);
    }
  }

  return (
    <div>
      <Input
        placeholder="Ville (ex: Paris)"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-2xl"
      />
      {suggestions.length > 0 && (
        <Command className="rounded-xl border shadow-md max-h-60 overflow-auto bg-white mt-1 animate-in fade-in slide-in-from-top-2">
          <CommandList>
            <CommandEmpty>Aucun résultat</CommandEmpty>
            <CommandGroup heading="Villes">
              {suggestions.map((place: any) => (
                <CommandItem
                  key={place.id}
                  onSelect={() => {
                    setCity(place.text); // ✅ ville validée
                    setSearch(place.text);
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
