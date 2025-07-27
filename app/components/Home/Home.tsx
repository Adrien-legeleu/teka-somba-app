'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FavoriteButton } from '../Favorite/FavoriteButton';
import FilterBar from '../Filter/Filterbar';
import { Category } from '@/types/category';
import { IconMapPin } from '@tabler/icons-react';

type Ad = {
  id: string;
  title: string;
  price: number;
  location?: string;
  images?: string[];
  isFavorite?: boolean;
};

export default function Home({ userId }: { userId?: string | null }) {
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // États filtres
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [isDon, setIsDon] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const urlCatId = searchParams.get('categoryId');
    if (!urlCatId) return;

    let foundParent: Category | null = null;
    let foundChild: Category | null = null;

    for (const cat of categories) {
      if (cat.id === urlCatId) {
        foundParent = cat;
        break;
      }
      if (cat.children) {
        const child = cat.children.find((sub) => sub.id === urlCatId);
        if (child) {
          foundParent = cat;
          foundChild = child;
          break;
        }
      }
    }

    setCategoryId(foundParent?.id || '');
    setSubCategoryId(foundChild?.id || '');
  }, [categories, searchParams]);

  const isDonParam = searchParams.get('isDon') === 'true';
  useEffect(() => setIsDon(isDonParam), [isDonParam]);

  const qParam = searchParams.get('q') || '';
  useEffect(() => setSearch(qParam), [qParam]);

  useEffect(() => {
    fetchAds();
  }, [
    categoryId,
    subCategoryId,
    city,
    isDon,
    userId,
    search,
    priceMin,
    priceMax,
    sortOrder,
  ]);

  async function fetchCategories() {
    const res = await fetch('/api/categories');
    const data: Category[] = await res.json();
    setCategories(data);
  }

  async function fetchAds() {
    setLoading(true);
    const params = new URLSearchParams();
    if (subCategoryId) params.append('categoryId', subCategoryId);
    else if (categoryId) params.append('categoryId', categoryId);
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

    const res = await fetch('/api/ad?' + params.toString());
    const data: Ad[] = await res.json();
    setAds(data);
    setLoading(false);
  }

  return (
    <div className="w-full mx-auto  pb-32 ">
      {/* Filtres */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        city={city}
        setCity={setCity}
        categories={categories}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        subCategoryId={subCategoryId}
        setSubCategoryId={setSubCategoryId}
        isDon={isDon}
        setIsDon={setIsDon}
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Résultats */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Chargement...</p>
      ) : ads.length === 0 ? (
        <p className="text-center rounded-2xl shadow-md bg-white p-10 text-gray-600">
          Aucune annonce trouvée.
        </p>
      ) : (
        <div className="grid grid-cols-1 px-10 home:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
          {ads.map((ad) => (
            <div key={ad.id} className="   overflow-hidden relative">
              <div className="relative">
                <Link href={`/annonce/${ad.id}`}>
                  {ad.images?.[0] && (
                    <Image
                      src={ad.images[0]}
                      alt={ad.title}
                      width={300}
                      height={200}
                      className="w-full aspect-square rounded-3xl  object-cover"
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
                <p className=" font-semibold mt-2 text-sm md:text-base">
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
