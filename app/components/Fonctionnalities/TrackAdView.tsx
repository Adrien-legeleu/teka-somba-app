// app/components/Fonctionnalities/TrackAdView.tsx
'use client';
import { useEffect, useRef } from 'react';

export default function TrackAdView({ adId }: { adId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return; // évite le double tir en dev/StrictMode
    fired.current = true;

    fetch(`/api/ad/${adId}/view`, { method: 'POST' }).catch(() => {});
  }, [adId]);

  return null;
}
