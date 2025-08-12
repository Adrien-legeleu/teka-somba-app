'use client';
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // S’assure que le fichier est bien là
      fetch('/sw.js', { cache: 'no-store' })
        .then(() => navigator.serviceWorker.register('/sw.js', { scope: '/' }))
        .then((reg) => {
          console.log('[PWA] SW registered:', reg.scope);
        })
        .catch((err) => console.error('[PWA] SW register failed:', err));
    }
  }, []);
  return null;
}
