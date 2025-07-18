'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { CityPicker } from './components/Filter/cityPicker';
import { CategoryPicker } from './components/Filter/Categorypicker';
import { SearchBar } from './components/Filter/SearchBar';

export default function Home() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');

  // Charge les catégories une seule fois au début
  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    const timeout = setTimeout(fetchAds, 300); // debounce
    return () => clearTimeout(timeout);
  }, [search, categoryId, subCategoryId, city]);

  // Rafraîchis les annonces à chaque changement de filtre
  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subCategoryId, city]);

  async function fetchCategories() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  }

  async function fetchAds() {
    setLoading(true);
    const params = new URLSearchParams();
    if (subCategoryId)
      params.append('categoryId', subCategoryId); // priorité sous-cat
    else if (categoryId) params.append('categoryId', categoryId);
    if (city) params.append('city', city);
    if (search) params.append('q', search);
    const res = await fetch('/api/ad?' + params.toString());
    const data = await res.json();
    setAds(data);
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Toutes les annonces</h1>
        <Button
          onClick={() => router.push('/dashboard/annonces/new')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Déposer une annonce
        </Button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CityPicker city={city} setCity={setCity} />
        <CategoryPicker
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          subCategoryId={subCategoryId}
          setSubCategoryId={setSubCategoryId}
        />
        <SearchBar search={search} setSearch={setSearch} />
      </div>

      {/* Résultats */}
      {loading ? (
        <p>Chargement...</p>
      ) : ads.length === 0 ? (
        <p>Aucune annonce trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Link
              key={ad.id}
              href={`/annonce/${ad.id}`}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
            >
              {ad.images?.[0] && (
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="rounded-xl w-full h-40 object-cover mb-3"
                />
              )}
              <h2 className="font-semibold text-lg line-clamp-1">{ad.title}</h2>
              <div className="text-primary font-bold mt-1">
                {ad.price.toLocaleString()} FCFA
              </div>
              {ad.location && (
                <div className="text-sm text-muted-foreground mt-1">
                  {ad.location}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
