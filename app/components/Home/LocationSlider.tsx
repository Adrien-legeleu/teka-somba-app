'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

type Props = {
  radius: number;
  setRadius: (radius: number) => void;
  lat: string | null;
  lng: string | null;
  setLat: (lat: string | null) => void;
  setLng: (lng: string | null) => void;
  min?: number;
  max?: number;
};

export default function LocationSlider({
  radius,
  setRadius,
  lat,
  lng,
  setLat,
  setLng,
  min = 1,
  max = 100,
}: Props) {
  const isActive = Boolean(lat && lng);
  const [localRadius, setLocalRadius] = useState<number>(radius);

  // Garde localRadius aligné si radius parent change ailleurs
  useEffect(() => {
    setLocalRadius(radius);
  }, [radius]);

  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth <= 768,
    []
  );

  const enableGeoloc = () => {
    const DEFAULT_RADIUS = Math.min(Math.max(10, min), max);

    if (!navigator.geolocation) {
      toast.error('La géolocalisation n’est pas supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
        setRadius(DEFAULT_RADIUS); // <= seulement une fois lat/lng connus
        toast.success('Position détectée !');
      },
      () => toast.error('Impossible d’obtenir la position !')
    );
  };

  const disableGeoloc = () => {
    setLat(null);
    setLng(null);
    toast.info('Recherche par localisation désactivée');
  };

  return (
    <div className="flex max-md:flex-col md:items-center max-md:px-6 w-full max-md:text-sm items-start relative md:gap-3 max-md:mt-2">
      <button
        type="button"
        onClick={() => {
          if (isActive) disableGeoloc();
          else enableGeoloc();
        }}
        className={`
          px-4 py-2 rounded-3xl cursor-pointer border font-bold shadow flex items-center gap-2 transition
          ${
            isActive
              ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500'
              : 'bg-white'
          }
        `}
      >
        {isActive ? 'Localisation activée' : 'Autour de moi'}
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            key="slider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, marginTop: isMobile ? 8 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.42, 0, 0.58, 1] }}
            className={`
              relative bottom-1
              ${isActive ? '' : 'pointer-events-none opacity-40'}
              ${isMobile ? 'min-h-[42px] w-[90vw] max-w-[220px]' : 'flex-1'}
            `}
          >
            <span className="relative font-bold text-black max-md:text-xs text-sm px-2 pointer-events-none select-none">
              {localRadius} km
            </span>

            {/* Fix #2 : onValueChange => UI seulement ; onValueCommit => applique le filtre */}
            <Slider
              value={[localRadius]}
              onValueChange={([val]) => setLocalRadius(val)}
              onValueCommit={([val]) => setRadius(val)}
              min={min}
              max={max}
              disabled={!isActive}
              className="[&>:last-child>span]:border-background [&>:last-child>span]:bg-primary *:data-[slot=slider-thumb]:shadow-none [&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:ring-offset-0"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
