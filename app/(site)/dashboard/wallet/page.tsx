'use client';

import { useEffect, useState } from 'react';
import WalletRecharge from '@/app/components/Payment/WalletRecharge';
import Link from 'next/link';
import Image from 'next/image';

type Ad = {
  id: string;
  title: string;
  boostUntil: string | null;
  boostType?: string | null;
  images?: string[];
};

export default function WalletPage() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    async function fetchBoostedAds() {
      const res = await fetch('/api/ad/user/boosted');
      const data = await res.json();
      setAds(data);
    }

    fetchBoostedAds();
  }, []);

  const boostedAds = ads.filter(
    (ad) => ad.boostUntil && new Date(ad.boostUntil) > new Date()
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      {/* Rechargement du portefeuille */}
      <div className="bg-gradient-to-tr from-orange-500 via-[#FF771F] to-orange-400 rounded-[2rem] shadow-2xl p-8 text-white">
        <h1 className="text-3xl font-extrabold text-center mb-4">
          💰 Mon Portefeuille
        </h1>
        <p className="text-center text-white/90 mb-6">
          Gérez vos crédits pour booster vos annonces et leur donner plus de
          visibilité.
        </p>
        <WalletRecharge />
      </div>

      {/* Section annonces boostées */}
      <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          🎯 Mes annonces boostées
        </h2>

        {boostedAds.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            Vous n’avez aucune annonce boostée pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {boostedAds.map((ad) => (
              <Link
                key={ad.id}
                href={`/annonce/${ad.id}`}
                className=" border-b  transition"
              >
                {ad.images?.[0] && (
                  <Image
                    src={ad.images[0]}
                    alt={ad.title}
                    width={400}
                    height={250}
                    className="w-full rounded-3xl border shadow-2xl shadow-[#0000010]  aspect-square object-cover"
                  />
                )}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {ad.title}
                  </h3>
                  {ad.boostType && (
                    <p className="text-sm text-gray-500">
                      Type :{' '}
                      <span className="uppercase font-medium text-orange-600">
                        {ad.boostType}
                      </span>
                    </p>
                  )}
                  <div className="text-sm text-gray-700 font-medium bg-orange-100 px-3 py-1 rounded-full w-fit">
                    Jusqu’au{' '}
                    <span className="text-orange-600 font-semibold">
                      {new Date(ad.boostUntil!).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
