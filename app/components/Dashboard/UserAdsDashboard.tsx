'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, Rows } from 'lucide-react';
import DeleteAdButton from '../Button/DeleteAdButton';
import EditAdButton from '../Button/EditAdButton';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { cn } from '@/lib/utils';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import DashboardPremiumOffers from '../Payment/DashboardPremiumOffers';
import { Category } from '@/types/category';
import Loader from '../Fonctionnalities/Loader';

type Ad = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  images: string[];
  boostUntil?: string | null;
};

type SortOrder = 'asc' | 'desc';

export default function UserAdsDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);

  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(fetchUserAds, 300);
    return () => clearTimeout(timeout);
  }, [sortOrder]);

  async function fetchUserAds() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('sortBy', 'createdAt');
    params.append('sortOrder', sortOrder);
    const res = await fetch(`/api/ad/user/${userId}?${params.toString()}`);
    const data: Ad[] = await res.json();
    setAds(data);
    setLoading(false);
  }

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="z-30 relative bg-neutral-50 backdrop-blur-xl py-5 flex items-center justify-center">
        <div className="bg-white p-5 shadow-black/10 shadow-2xl border rounded-full flex items-center justify-between mx-auto max-w-5xl w-full">
          <h1 className="md:text-3xl sm:text-2xl text-lg max-sm:text-center font-bold">
            Mes annonces
          </h1>
          <Button
            onClick={() => router.push('/dashboard/annonces/new')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition rounded-full px-6 py-3 text-lg shadow-xl"
          >
            <PlusCircle className="w-5 h-5" />
            Nouvelle annonce
          </Button>
        </div>
      </div>

      <div className="mt-8 relative">
        {/* Filtre flottant */}
        <div className=" sticky w-fit  rounded-3xl top-2 p-2 left-2 flex items-center  gap-2 bg-white/90 backdrop-blur-xl shadow-xl border z-50">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded-3xl p-2 border shadow bg-white text-gray-700 text-xs md:text-sm hover:border-gray-400 transition"
          >
            <option value="desc">Plus récentes</option>
            <option value="asc">Plus anciennes</option>
          </select>
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="rounded-2xl border bg-white p-2 shadow hover:bg-gray-50 transition"
            title="Changer la vue"
          >
            {isCompact ? <Rows size={18} /> : <LayoutGrid size={18} />}
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : ads.length === 0 ? (
          <p className="text-gray-500 h-screen flex text-center items-center justify-center p-8">
            Aucune annonce publiée.
          </p>
        ) : (
          <div
            className={cn(
              'grid gap-5 mt-16  p-6 transition-all',
              isCompact
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {ads.map((ad) => (
              <div key={ad.id} className="relative pb-4">
                <div className="relative">
                  <Link href={`/annonce/${ad.id}`} target="_blank">
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

                  {ad.boostUntil && new Date(ad.boostUntil) > new Date() && (
                    <div className="group absolute top-2 left-2 bg-white/90 backdrop-blur-xl mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                      <span
                        className={cn(
                          'absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]'
                        )}
                        style={{
                          WebkitMask:
                            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'destination-out',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'subtract',
                          WebkitClipPath: 'padding-box',
                        }}
                      />
                      <AnimatedGradientText className="text-sm font-medium">
                        Boosté
                      </AnimatedGradientText>
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

                {/* Boutons */}
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex items-center justify-center gap-0">
                    <EditAdButton adId={ad.id} />
                    <DeleteAdButton
                      userId={userId}
                      adId={ad.id}
                      onDeleted={() =>
                        setAds((prev) => prev.filter((a) => a.id !== ad.id))
                      }
                    />
                  </div>
                  {!ad.boostUntil ||
                    (new Date(ad.boostUntil) < new Date() && (
                      <div onClick={() => setSelectedAdId(ad.id)}>
                        <InteractiveHoverButton text="Booster" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Premium */}
      {selectedAdId && (
        <DashboardPremiumOffers
          adId={selectedAdId}
          onClose={() => setSelectedAdId(null)}
        />
      )}
    </div>
  );
}
