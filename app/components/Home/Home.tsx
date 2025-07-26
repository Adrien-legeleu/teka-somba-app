'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { FavoriteButton } from '../Favorite/FavoriteButton';
import FilterBar from '../Filter/Filterbar';

export default function Home({ userId }: { userId?: string | null }) {
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // États filtres
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [isDon, setIsDon] = useState(false);

  // Récupère catégories au chargement
  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialise le filtre catégorie depuis l'URL (quand catégories chargées)
  useEffect(() => {
    if (categories.length === 0) return;
    const urlCatId = searchParams.get('categoryId');
    if (!urlCatId) return;

    let foundParent = null;
    let foundChild = null;

    for (const cat of categories) {
      if (cat.id === urlCatId) {
        foundParent = cat;
        break;
      }
      if (cat.children) {
        const child = cat.children.find((sub: any) => sub.id === urlCatId);
        if (child) {
          foundParent = cat;
          foundChild = child;
          break;
        }
      }
    }

    if (foundParent && foundChild) {
      setCategoryId(foundParent.id);
      setSubCategoryId(foundChild.id);
    } else if (foundParent) {
      setCategoryId(foundParent.id);
      setSubCategoryId('');
    } else {
      // Si jamais c'est une sous-sous-catégorie (niveau 3+), tu peux ajouter une recherche plus profonde ici
      setCategoryId('');
      setSubCategoryId('');
    }
    // Ajoute searchParams pour chaque changement d'URL
  }, [categories, searchParams]);

  const isDonParam = searchParams.get('isDon') === 'true';

  useEffect(() => {
    setIsDon(isDonParam);
  }, [isDonParam]);
  const qParam = searchParams.get('q') || '';
  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subCategoryId, city, isDon, userId, search]);

  async function fetchCategories() {
    const res = await fetch('/api/categories');
    const data = await res.json();
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
    const res = await fetch('/api/ad?' + params.toString());
    const data = await res.json();
    setAds(data);
    setLoading(false);
  }

  return (
    <div className=" w-full mx-auto  ">
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
      />

      {/* Résultats */}
      {loading ? (
        <p>Chargement...</p>
      ) : ads.length === 0 ? (
        <p className="shadow-[#0000001c]  bg-white/90 backdrop-blur-xl p-10 ">
          Aucune annonce trouvée.
        </p>
      ) : (
        <div className="grid grid-cols-1 z-10 shadow-[#0000001c]  bg-white/90 backdrop-blur-xl p-10  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {ads.map((ad) => (
            <div key={ad.id} className="border-b  pb-2">
              <div className="relative ">
                <Link href={`/annonce/${ad.id}`} className="   transition">
                  {ad.images?.[0] && (
                    <Image
                      src={ad.images[0]}
                      alt={ad.title}
                      width={300}
                      height={200}
                      className="rounded-3xl aspect-square shadow-2xl shadow-[#0000010] border border-gray-100 w-full object-cover "
                    />
                  )}
                </Link>
                <FavoriteButton
                  userId={userId}
                  adId={ad.id}
                  isFavoriteInitial={ad.isFavorite}
                />
              </div>
              <Link href={`/annonce/${ad.id}`} className="transition">
                <h2 className="font-semibold text-lg line-clamp-1">
                  {ad.title}
                </h2>
                <div className="text-primary font-bold mt-1">
                  {ad.price.toLocaleString()} FCFA
                </div>
                {ad.location && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {ad.location}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
