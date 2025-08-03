'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  const isActive = lat && lng;
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex max-md:flex-col md:items-center items-start max-md:left-6 relative md:gap-3 max-md:mt-2 w-full">
      <button
        type="button"
        onClick={() => {
          if (isActive) {
            setLat(null);
            setLng(null);
            toast.info('Recherche par localisation désactivée');
          } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setLat(pos.coords.latitude.toString());
                setLng(pos.coords.longitude.toString());
                toast.success('Position détectée !');
              },
              () => toast.error('Impossible d’obtenir la position !')
            );
          } else {
            toast.error('La géolocalisation n’est pas supportée');
          }
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
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: hovered ? 38 : 20,
              marginTop:
                typeof window !== 'undefined' && window.innerWidth <= 768
                  ? 8
                  : 0, // mt-2 sur mobile
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.42, 0, 0.58, 1] }}
            className={`
              location-slider relative
              ${isActive ? '' : 'pointer-events-none opacity-40'}
              ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'min-h-[38px] w-[90vw] max-w-[320px]' : 'flex-1'}
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <input
              type="range"
              min={min}
              max={max}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className={`h-full ${
                typeof window !== 'undefined' && window.innerWidth <= 768
                  ? 'w-full'
                  : 'w-[180px]'
              }`}
              style={{
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              disabled={!isActive}
            />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 font-bold text-black text-base px-2 pointer-events-none select-none">
              {radius} km
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
