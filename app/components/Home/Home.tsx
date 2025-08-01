'use client';

import { useEffect, useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin } from '@tabler/icons-react';
import { useFilter } from './FilterContext';
import { FavoriteButton } from '../Favorite/FavoriteButton';
import FilterBarDesktop from './FilterBarDesktop';
import Loader from '../Fonctionnalities/Loader';

type Ad = {
  id: string;
  title: string;
  price: number;
  location?: string;
  images?: string[];
  isFavorite?: boolean;
};

export default function Home({ userId }: { userId?: string | null }) {
  const {
    categoryId,
    subCategoryId,
    city,
    search,
    isDon,
    priceMin,
    priceMax,
    sortOrder,
  } = useFilter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch ads whenever filters change or userId prop changes
  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      const params = new URLSearchParams();
      if (subCategoryId) {
        params.append('categoryId', subCategoryId);
      } else if (categoryId) {
        params.append('categoryId', categoryId);
      }
      if (city) params.append('city', city);
      if (search) params.append('q', search);
      if (isDon) params.append('isDon', 'true');
      if (userId) params.append('userId', userId);
      if (priceMin) params.append('priceMin', priceMin);
      if (priceMax) params.append('priceMax', priceMax);
      if (sortOrder) {
        params.append('sortBy', 'price');
        params.append('sortOrder', sortOrder);
      }
      try {
        const res = await fetch('/api/ad?' + params.toString());
        const data: Ad[] = await res.json();
        setAds(data);
      } catch (err) {
        console.error('Failed to fetch ads', err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, [
    categoryId,
    subCategoryId,
    city,
    search,
    isDon,
    priceMin,
    priceMax,
    sortOrder,
    userId,
  ]);

  return (
    <div
      className=" w-full flex min-h-[60vh] relative
     flex-col items-center gap-10 "
    >
      <FilterBarDesktop />
      {loading ? (
        <Loader />
      ) : ads.length === 0 ? (
        <p className="text-center rounded-2xl mt-4 shadow-md bg-white p-10 text-gray-600">
          Aucune annonce trouvée.
        </p>
      ) : (
        <div className="grid grid-cols-1 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 px-4 md:px-10">
          {ads.map((ad) => (
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
      )}
    </div>
  );
}
