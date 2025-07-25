'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

export function CitySection({
  city,
  setCity,
  isActive,
  close,
}: {
  city: string;
  setCity: (val: string) => void;
  isActive: boolean;
  close: () => void;
}) {
  const [search, setSearch] = useState(city || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  async function handleSearch(q: string) {
    setSearch(q);
    setCity('');
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
    <div className="relative flex flex-col gap-1">
      <Label htmlFor="city" className="font-semibold text-sm">
        Ville
      </Label>
      <Input
        id="city"
        placeholder="Paris, Lyon, Marseille..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-full text-sm border-none shadow-none focus:ring-0 bg-transparent"
      />

      <AnimatePresence>
        {isActive && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 right-0 bg-white shadow-md rounded-xl p-2 z-50"
          >
            {suggestions.map((place: any) => (
              <div
                key={place.id}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg"
                onClick={() => {
                  setCity(place.text);
                  setSearch(place.text);
                  setSuggestions([]);
                  close();
                }}
              >
                {place.place_name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
