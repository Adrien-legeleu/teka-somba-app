'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FavoriteButton } from './FavoriteButton';

type Favorite = {
  id: string;
  title: string;
  images: string[];
  price: number;
  location: string;
  isFavorite: boolean;
  category: { id: string; name: string };
};

export default function FavoriteDashboard({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const res = await fetch(`/api/favorite?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [userId]);

  if (loading) return <div>Chargement...</div>;

  if (!favorites.length)
    return <div className="text-gray-500 p-8">Aucune annonce en favori.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-8">
      {favorites.map((fav) => (
        <div className="relative" key={fav.id}>
          <FavoriteButton
            userId={userId}
            adId={fav.id}
            isFavoriteInitial={fav.isFavorite}
          />
          <Link
            href={`/annonce/${fav.id}`}
            className="rounded-2xl bg-white relative shadow-lg hover:shadow-xl hover:scale-[1.02] transition p-4 flex gap-4 items-center"
          >
            <div className="min-w-[90px] max-w-[90px] h-[90px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {fav.images?.length ? (
                <Image
                  src={fav.images[0]}
                  alt={fav.title}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-300">Pas d'image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg truncate">{fav.title}</div>
              <div className="text-primary font-bold mt-1">
                {fav.price === 0
                  ? 'Gratuit'
                  : fav.price?.toLocaleString() + ' FCFA'}
              </div>
              <div className="text-gray-500 mt-1 text-sm flex flex-wrap gap-2">
                <span>{fav.category?.name}</span>
                <span>·</span>
                <span>{fav.location}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
