'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash } from 'lucide-react';
import Image from 'next/image';

export default function DashboardAnnonces() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/my-ads')
      .then((res) => res.json())
      .then((data) => {
        setAds(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return;
    await fetch(`/api/ad/${id}`, { method: 'DELETE' });
    setAds((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mes annonces</h1>
        <Button onClick={() => router.push('/dashboard/annonces/new')}>
          + Nouvelle annonce
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {ads.map((ad) => (
            <Card key={ad.id} className="relative">
              <CardContent className="p-0">
                <Image
                  src={ad.images?.[0] || '/placeholder.jpg'}
                  alt={ad.title}
                  width={400}
                  height={250}
                  className="rounded-t-xl object-cover w-full h-48"
                />
                <div className="p-4">
                  <h2 className="font-bold text-lg truncate mb-1">
                    {ad.title}
                  </h2>
                  <p className="text-sm text-gray-500">{ad.category?.name}</p>
                  <p className="text-primary font-semibold mt-2">
                    {ad.price.toLocaleString()} FCFA
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/annonces/${ad.id}`)
                      }
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash className="w-4 h-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
