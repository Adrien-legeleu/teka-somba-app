'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AdDetailsPage() {
  const { id } = useParams();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch(`/api/ad/${id}`);
        const data = await res.json();
        setAd(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAd();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    );
  }

  if (!ad) return <div className="p-10 text-center">Annonce introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow">
      <h1 className="text-2xl font-bold mb-2">{ad.title}</h1>
      <Badge variant="outline" className="mb-4">
        {ad.category?.name}
      </Badge>

      {ad.images && ad.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {ad.images.map((img: string, i: number) => (
            <Image
              key={i}
              src={img}
              width={400}
              height={300}
              alt={`image-${i}`}
              className="rounded-xl object-cover w-full h-64"
            />
          ))}
        </div>
      )}

      <p className="text-gray-700 mb-4 whitespace-pre-line">{ad.description}</p>
      <div className="text-lg font-semibold mb-2">
        {(ad.price / 100).toLocaleString()} FCFA
      </div>

      {ad.location && (
        <div className="text-gray-500 text-sm">{ad.location}</div>
      )}

      <div className="mt-6 border-t pt-4">
        <h2 className="font-semibold mb-2">Vendeur</h2>
        <div className="flex items-center gap-3">
          {ad.user?.avatar && (
            <Image
              src={ad.user.avatar}
              width={40}
              height={40}
              alt="avatar"
              className="rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium">
            {ad.user?.name || 'Utilisateur'}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="default">Contacter</Button>
      </div>
    </div>
  );
}
