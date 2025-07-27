'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

type MapboxFeature = {
  id: string;
  text: string;
  place_name: string;
};

interface CitySectionProps {
  city: string;
  setCity: (val: string) => void;
}

export function CitySection({ city, setCity }: CitySectionProps) {
  const [search, setSearch] = useState(city || '');
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function handleSearch(q: string) {
    setSearch(q);
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&autocomplete=true&language=fr&types=place`
      );
      const data = await res.json();
      setSuggestions((data.features as MapboxFeature[]) || []);
      setOpen(true);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }

  // Fermer au clic hors du composant
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1 w-full">
      <Label htmlFor="city" className="font-semibold text-xs">
        Ville
      </Label>

      <input
        id="city"
        placeholder="Paris, Lyon, Marseille..."
        value={search}
        onFocus={() => search && suggestions.length > 0 && setOpen(true)}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-full text-sm bg-transparent border-none shadow-none
                 focus:outline-none focus:ring-0 focus:border-none "
      />

      {createPortal(
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 30 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bg-white shadow-md rounded-3xl p-5 z-[9999]"
              style={{
                position: 'absolute',
                top:
                  (wrapRef.current?.getBoundingClientRect().bottom ?? 0) +
                  window.scrollY,
                left:
                  (wrapRef.current?.getBoundingClientRect().left ?? 0) +
                  window.scrollX,
                width: wrapRef.current?.offsetWidth ?? 200,
              }}
            >
              {suggestions.map((place) => (
                <div
                  key={place.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded-3xl transition"
                  onClick={() => {
                    setCity(place.text);
                    setSearch(place.text);
                    setSuggestions([]);
                    setOpen(false);
                  }}
                >
                  {place.place_name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
