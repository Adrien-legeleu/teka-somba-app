import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

type MapboxFeature = { id: string; text: string; place_name: string };

interface CitySectionProps {
  city: string;
  setCity: (val: string) => void;
}

const MAIN_CITIES = [
  'Kinshasa',
  'Lubumbashi',
  'Goma',
  'Mbujimayi',
  'Kananga',
  'Kisangani',
  'Bukavu',
  'Matadi',
  'Boma',
  'Mbandaka',
];

export function CitySection({ city, setCity }: CitySectionProps) {
  const [search, setSearch] = useState(city || '');
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // sync si city change depuis l’extérieur
  useEffect(() => {
    setSearch(city || '');
  }, [city]);

  function handleSearchDebounced(q: string) {
    setSearch(q);

    // si l’utilisateur vide le champ → reset filtre
    if (q.trim() === '') {
      setCity('');
      setSuggestions([]);
      setOpen(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 350);
  }

  async function doSearch(q: string) {
    const query = q.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
          `?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}` +
          `&autocomplete=true&language=fr&types=place,locality,region,country&limit=8&proximity=23.654,-2.879`
      );
      const data = await res.json();
      setSuggestions((data.features as MapboxFeature[]) || []);
      setOpen(true);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const clearCity = () => {
    setSearch('');
    setCity('');
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className="w-full">
      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
        Ville
      </Label>

      {/* Input (mobile full, desktop max-w) */}
      <div className="relative w-full md:max-w-md">
        <input
          ref={inputRef}
          id="city"
          placeholder="Kinshasa, Mbujimayi, Lubumbashi..."
          value={search}
          onFocus={() => search && suggestions.length > 0 && setOpen(true)}
          onChange={(e) => handleSearchDebounced(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="w-full mt-1 p-4 rounded-3xl border border-black/5 bg-white shadow-lg shadow-black/5 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm pr-10"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* Bouton clear */}
        {search && (
          <button
            type="button"
            onClick={clearCity}
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
            aria-label="Effacer la ville"
            title="Effacer"
          >
            <IconX />
          </button>
        )}

        {/* Dropdown ancré */}
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-3xl p-4 z-50 max-h-60 overflow-y-auto"
            >
              {suggestions.map((place) => (
                <div
                  key={place.id}
                  className="px-3 py-2 hover:bg-gray-100 rounded-3xl cursor-pointer text-sm"
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
        </AnimatePresence>
      </div>

      {/* Villes principales (toujours en dessous) */}
      <div className="relative mt-3 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-20" />

        <div
          className="flex gap-2 px-3 py-1 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {MAIN_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCity(c);
                setSearch(c);
                setOpen(false);
              }}
              className="whitespace-nowrap border border-orange-200 bg-orange-50 shadow-sm rounded-2xl px-4 py-2 text-sm md:rounded-xl md:px-2.5 md:py-1 md:text-[11px] hover:bg-orange-100 transition-all"
            >
              {c}
            </button>
          ))}
          {/* Chip “Aucune ville / Réinitialiser” */}
          <button
            onClick={clearCity}
            className="whitespace-nowrap border border-gray-200 bg-white shadow-sm rounded-2xl px-4 py-2 text-sm md:rounded-xl md:px-2.5 md:py-1 md:text-[11px] hover:bg-gray-50 transition-all"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
