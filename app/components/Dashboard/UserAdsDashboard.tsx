'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import FilterBar from '../Filter/Filterbar';
import { FavoriteButton } from '../Favorite/FavoriteButton';
import PremiumModal from '../Payment/PremiumOffers';

export default function UserAdsDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [isDon, setIsDon] = useState(false);

  // Modal Premium
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchUserAds, 300); // debounce
    return () => clearTimeout(timeout);
  }, [search, categoryId, subCategoryId, city]);

  useEffect(() => {
    fetchUserAds();
  }, [categoryId, subCategoryId, city]);

  async function fetchCategories() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  }

  async function fetchUserAds() {
    setLoading(true);
    const params = new URLSearchParams();
    if (subCategoryId)
      params.append('categoryId', subCategoryId); // priorité sous-cat
    else if (categoryId) params.append('categoryId', categoryId);
    if (city) params.append('city', city);
    if (search) params.append('q', search);
    if (isDon) params.append('isDon', 'true');
    const res = await fetch(`/api/ad/user/${userId}?${params.toString()}`);
    const data = await res.json();
    setAds(data);
    setLoading(false);
  }

  async function handleDelete(adId: string) {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    const res = await fetch(`/api/ad/user/${userId}/${adId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast.success('Annonce supprimée');
      setAds((ads) => ads.filter((a) => a.id !== adId));
    } else {
      const error = await res.json();
      toast.error(error.error || 'Erreur à la suppression');
    }
  }

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="z-30 relative  bg-neutral-50 backdrop-blur-xl py-5 flex items-center justify-center">
        <div className="bg-white p-5  shadow-black/10  shadow-2xl border rounded-full flex items-center justify-between mx-auto max-w-5xl w-full">
          <h1 className="text-3xl font-bold">Mes annonces</h1>
          <Button
            onClick={() => router.push('/dashboard/annonces/new')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition rounded-full px-6 py-3 text-lg shadow-xl"
          >
            <PlusCircle className="w-5 h-5" />
            Nouvelle annonce
          </Button>
        </div>
      </div>

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
        <p className="shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-10 rounded-[3rem]">
          Aucune annonce publiée.
        </p>
      ) : (
        <div className="grid grid-cols-1 shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 rounded-[3rem]">
          {ads.map((ad) => (
            <div key={ad.id} className="relative pb-4">
              <div className="relative">
                <Link
                  href={`/annonce/${ad.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ad.images?.[0] && (
                    <Image
                      src={ad.images[0]}
                      alt={ad.title}
                      width={300}
                      height={200}
                      className="rounded-3xl aspect-square shadow-2xl shadow-[#00000010] border border-gray-100 w-full object-cover"
                    />
                  )}
                </Link>
                <FavoriteButton
                  userId={userId}
                  adId={ad.id}
                  isFavoriteInitial={ad.isFavorite}
                />
                {ad.boostUntil && new Date(ad.boostUntil) > new Date() && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                    Boosté
                  </div>
                )}
              </div>

              <div className="mt-2">
                <h2 className="font-semibold text-lg line-clamp-1">
                  {ad.title}
                </h2>
                <div className="text-primary font-bold mt-1">
                  {ad.price?.toLocaleString()} FCFA
                </div>
                {ad.location && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {ad.location}
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  title="Modifier"
                  onClick={() => router.push(`/dashboard/annonces/${ad.id}`)}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Supprimer"
                  onClick={() => handleDelete(ad.id)}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="ml-auto bg-orange-500 text-white hover:bg-orange-600"
                  onClick={() => setSelectedAdId(ad.id)}
                >
                  Booster
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Premium */}
      {selectedAdId && (
        <PremiumModal
          adId={selectedAdId}
          onClose={() => setSelectedAdId(null)}
        />
      )}
    </div>
  );
}
