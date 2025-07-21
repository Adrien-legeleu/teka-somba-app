'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/ui/aurora-background';
import Image from 'next/image';
import { useMe } from '@/hooks/useMe';
import ContactSellerModal from '@/app/components/Contact/ContactSellerModal';
export default function AdDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { me, loading: loadingMe } = useMe();

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

  if (loading || loadingMe) {
    return (
      <AuroraBackground className="min-h-screen flex items-start justify-start py-10">
        <div className="max-w-5xl w-full mx-auto p-10 bg-white rounded-3xl shadow-2xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </AuroraBackground>
    );
  }

  if (!ad) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto p-10 bg-white rounded-3xl shadow-2xl text-center text-xl font-semibold">
          Annonce introuvable.
        </div>
      </AuroraBackground>
    );
  }

  const isSeller = me?.id === ad.user?.id;

  return (
    <AuroraBackground className="min-h-screen flex items-start justify-start py-10">
      <div className="max-w-5xl w-full mx-auto p-8 bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-10">
        {/* Bloc images sans animation, fluide */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow">
            <Image
              src={ad.images?.[activeImage]}
              fill
              alt={`image-${activeImage}`}
              className="object-cover rounded-3xl"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {ad.images?.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {ad.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-3 h-3 rounded-full border-2 ${activeImage === i ? 'bg-orange-500 border-orange-600' : 'bg-white border-gray-300'} transition`}
                    aria-label={`Voir image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          {ad.images?.length > 1 && (
            <div className="flex gap-3 mt-2">
              {ad.images.map((img: string, i: number) => (
                <div
                  key={i}
                  className={`relative h-16 w-20 rounded-3xl overflow-hidden border-2 cursor-pointer ${activeImage === i ? 'border-orange-500' : 'border-transparent'}`}
                  onClick={() => setActiveImage(i)}
                  style={{ minWidth: 80, minHeight: 64 }} // sécurité pour Next
                >
                  <Image
                    src={img}
                    fill
                    alt={`miniature-${i}`}
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloc infos */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 mb-3">
              <h1 className="text-3xl font-bold">{ad.title}</h1>
              <Badge
                variant="outline"
                className="text-base px-4 rounded-3xl py-2"
              >
                {ad.category?.name}
              </Badge>
            </div>
            <div className="text-2xl font-semibold text-orange-600 mb-4">
              {ad.price} FCFA
            </div>

            {ad.location && (
              <div className="flex items-center gap-2 text-gray-500 text-md mb-3">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  className="text-orange-400"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="1.6"
                    d="M10 17.8c4.2-4.2 6.3-7.3 6.3-9.8A6.3 6.3 0 0 0 10 1.7a6.3 6.3 0 0 0-6.3 6.3c0 2.5 2.1 5.6 6.3 9.8Z"
                  />
                  <circle
                    cx="10"
                    cy="8.2"
                    r="2.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
                {ad.location}
              </div>
            )}
            <div className="mb-5 text-gray-700 whitespace-pre-line text-lg leading-relaxed">
              {ad.description}
            </div>
          </div>

          {/* Vendeur */}
          <div className="mt-6 border-t pt-5 flex items-center gap-4">
            {ad.user?.avatar && (
              <Image
                src={ad.user.avatar}
                width={52}
                height={52}
                alt="avatar"
                className="rounded-full object-cover shadow"
              />
            )}
            <div>
              <div className="font-medium text-lg">
                <span> {ad.user?.prenom || 'Utilisateur'} </span>
                {ad.user?.name || 'Utilisateur'}
              </div>
              {/* Option : infos vendeur supplémentaires ici */}
            </div>
            <div className="ml-auto">
              {!me ? (
                <Button
                  size="lg"
                  className="rounded-2xl px-8 py-3 text-lg shadow-xl bg-orange-500 hover:bg-orange-600 transition"
                  onClick={() => router.push('/login')}
                >
                  Se connecter pour contacter
                </Button>
              ) : isSeller ? (
                <Button
                  size="lg"
                  className="rounded-2xl px-8 py-3 text-lg shadow-xl bg-orange-400 hover:bg-orange-600 transition"
                  onClick={() => router.push(`/dashboard/annonces/${ad.id}`)}
                >
                  Modifier l’annonce
                </Button>
              ) : (
                <ContactSellerModal
                  ad={ad}
                  user={me}
                  disabled={false}
                  onSent={() => router.push('/dashboard/messages')}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
