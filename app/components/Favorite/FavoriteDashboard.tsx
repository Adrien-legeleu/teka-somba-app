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
    <div className="grid grid-cols-1 z-10 shadow-[#0000001c]  bg-white/90 backdrop-blur-xl p-10  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {favorites.map((fav) => (
        <div key={fav.id} className="border-b  pb-2">
          <div className="relative ">
            <Link href={`/annonce/${fav.id}`} className="   transition">
              {fav.images?.[0] && (
                <Image
                  src={fav.images[0]}
                  alt={fav.title}
                  width={300}
                  height={200}
                  className="rounded-3xl aspect-square shadow-2xl shadow-[#0000010] border border-gray-100 w-full object-cover "
                />
              )}
            </Link>
            <FavoriteButton
              userId={userId}
              adId={fav.id}
              isFavoriteInitial={fav.isFavorite}
            />
          </div>
          <Link href={`/annonce/${fav.id}`} className="transition">
            <h2 className="font-semibold text-lg line-clamp-1">{fav.title}</h2>
            <div className="text-primary font-bold mt-1">
              {fav.price.toLocaleString()} FCFA
            </div>
            {fav.location && (
              <div className="text-sm text-muted-foreground mt-1">
                {fav.location}
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
