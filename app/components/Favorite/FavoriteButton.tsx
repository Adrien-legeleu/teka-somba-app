'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export function FavoriteButton({
  adId,
  userId,
  isFavoriteInitial,
}: {
  adId: string;
  userId?: string | null; // Peut être undefined si pas connecté
  isFavoriteInitial: boolean | undefined;
}) {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleFavorite = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/favorite', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, userId }),
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur favoris');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleToggleFavorite();
      }}
      disabled={loading}
      className={clsx('favorite-button absolute top-2 right-2')}
    >
      {/* Icône vide */}
      <svg
        className={clsx('empty', isFavorite && 'hidden')}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path fill="none" d="M0 0H24V24H0z"></path>
        <path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2zm-3.566 15.604c.881-.556 1.676-1.109 2.42-1.701C18.335 14.533 20 11.943 20 9c0-2.36-1.537-4-3.5-4-1.076 0-2.24.57-3.086 1.414L12 7.828l-1.414-1.414C9.74 5.57 8.576 5 7.5 5 5.56 5 4 6.656 4 9c0 2.944 1.666 5.533 4.645 7.903.745.592 1.54 1.145 2.421 1.7.299.189.595.37.934.572.339-.202.635-.383.934-.571z"></path>
      </svg>

      {/* Icône remplie */}
      <svg
        className={clsx('filled', !isFavorite && 'hidden')}
        height="24"
        width="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0H24V24H0z" fill="none"></path>
        <path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z"></path>
      </svg>
    </button>
  );
}
