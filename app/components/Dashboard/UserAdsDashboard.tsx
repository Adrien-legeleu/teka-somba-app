'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { CityPicker } from '../Filter/cityPicker';
import { CategoryPicker } from '../Filter/Categorypicker';
import { SearchBar } from '../Filter/SearchBar';
import { DonSwitch } from '../Filter/DonSwitch';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PremiumOffers } from '../Payment/PremiumOffers';

export default function UserAdsDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [isDon, setIsDon] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  function openModal(adId: string) {
    setSelectedAdId(adId);
    setShowModal(true);
  }

  function closeModal() {
    setSelectedAdId(null);
    setShowModal(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchUserAds, 300); // debounce
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [search, categoryId, subCategoryId, city]);

  useEffect(() => {
    fetchUserAds();
    // eslint-disable-next-line
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
    <div className="max-w-5xl w-full mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl shadow-[#0000001c] flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">Mes annonces</h1>
        <Button
          onClick={() => router.push('/dashboard/annonces/new')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Nouvelle annonce
        </Button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 rounded-[3rem] shadow-2xl shadow-[#0000001c]  bg-white/90 backdrop-blur-xl p-10 sm:grid-cols-3 gap-4 mb-4">
        <CityPicker city={city} setCity={setCity} />
        <CategoryPicker
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          subCategoryId={subCategoryId}
          setSubCategoryId={setSubCategoryId}
        />
        <SearchBar search={search} setSearch={setSearch} />
        <DonSwitch isDon={isDon} setIsDon={setIsDon} /> {/* Ajout */}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : ads.length === 0 ? (
        <p className="bg-white/90 backdrop-blur-xl p-10 shadow-2xl shadow-[#0000001c]  rounded-[3rem]">
          Aucune annonce publiée.
        </p>
      ) : (
        <div className="grid grid-cols-1 rounded-[3rem] bg-white/90 shadow-2xl shadow-[#0000001c] backdrop-blur-xl p-10 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="relative bg-white rounded-3xl  p-4 hover:shadow-lg transition flex flex-col"
            >
              <Link
                href={`/annonce/${ad.id}`}
                className="block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ad.images?.[0] && (
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="rounded-xl w-full h-40 object-cover mb-3"
                  />
                )}
                {ad.boostUntil && new Date(ad.boostUntil) > new Date() && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                    Boosté
                  </div>
                )}

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
                <div className="text-xs mt-1">{ad.category?.name}</div>
              </Link>
              <div className="flex gap-2 mt-4">
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
                  onClick={() => openModal(ad.id)}
                  className="mt-2"
                >
                  Booster
                </Button>
                <Dialog>
                  <DialogTrigger>
                    {ad.boostUntil && new Date(ad.boostUntil) > new Date()
                      ? "Booster jusqu'au " +
                        new Date(ad.boostUntil).toLocaleDateString('fr-FR')
                      : 'Booster cette annonce'}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && selectedAdId && (
        <PremiumOffers adId={selectedAdId} onClose={closeModal} />
      )}
    </div>
  );
}
