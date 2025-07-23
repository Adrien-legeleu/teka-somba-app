'use client';

import { useEffect, useState } from 'react';
import WalletRecharge from '@/app/components/Payment/WalletRecharge';

type Ad = {
  id: string;
  title: string;
  boostUntil: string | null;
  boostType?: string | null;
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
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* Rechargement portefeuille */}
      <WalletRecharge />

      {/* Section annonces boostées */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🎯 Mes annonces boostées
        </h2>

        {boostedAds.length === 0 ? (
          <p className="text-center text-gray-500">
            Vous n’avez aucune annonce boostée pour le moment.
          </p>
        ) : (
          <ul className="space-y-4">
            {boostedAds.map((ad) => (
              <li
                key={ad.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {ad.title}
                  </h3>
                  {ad.boostType && (
                    <p className="text-sm text-gray-500 mt-1">
                      Type :{' '}
                      <span className="uppercase font-medium">
                        {ad.boostType}
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Jusqu’au{' '}
                  <span className="text-black">
                    {new Date(ad.boostUntil!).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
