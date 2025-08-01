'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FavoriteButton } from './FavoriteButton';
import { IconMapPin } from '@tabler/icons-react';
import Loader from '../Fonctionnalities/Loader';

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

  if (loading) return <Loader />;
  if (!favorites.length)
    return (
      <div className="text-gray-500 h-screen flex text-center items-center justify-center p-8">
        Aucune annonce en favori.
      </div>
    );

  return (
    <div className="grid grid-cols-1 z-10 shadow-[#0000001c]  bg-white/90 backdrop-blur-xl p-10  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {favorites.map((ad) => (
        <div key={ad.id} className="overflow-hidden relative">
          <div className="relative">
            <Link href={`/annonce/${ad.id}`}>
              {ad.images?.[0] && (
                <Image
                  src={ad.images[0]}
                  alt={ad.title}
                  width={1000}
                  height={800}
                  className="w-full aspect-square rounded-3xl object-cover"
                />
              )}
            </Link>
            <FavoriteButton
              userId={userId}
              adId={ad.id}
              isFavoriteInitial={ad.isFavorite}
            />
          </div>
          <Link href={`/annonce/${ad.id}`} className="block pl-1 py-4">
            <h2 className="font-semibold text-sm md:text-base line-clamp-1">
              {ad.title}
            </h2>
            {ad.location && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <IconMapPin size={14} className="mr-1" /> {ad.location}
              </div>
            )}
            <p className="font-semibold mt-2 text-sm md:text-base">
              {ad.price.toLocaleString()} FCFA
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}
