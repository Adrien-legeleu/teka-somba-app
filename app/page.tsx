'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAds();
  }, []);

  async function fetchCategories() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  }

  async function fetchAds() {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (city) params.append('city', city);
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
        <Input
          placeholder="Ville (ex: Paris)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <Select value={categoryId} onValueChange={(val) => setCategoryId(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={fetchAds} className="w-full">
          Filtrer
        </Button>
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
