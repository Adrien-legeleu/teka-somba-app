'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function WalletRecharge() {
  const [loading, setLoading] = useState(false);

  const handleRecharge = async (amount: number) => {
    setLoading(true);
    const res = await fetch('/api/wallet/checkout', {
      method: 'POST',
      body: JSON.stringify({ amount }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setLoading(false);
    if (data?.url) window.location.href = data.url;
  };

  const offers = [
    { amount: 5000, credits: 5000, highlight: false },
    { amount: 10000, credits: 10000, highlight: false },
    { amount: 15000, credits: 17500, highlight: true, tag: '🔥 Populaire' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-extrabold text-center text-white drop-shadow-md">
        Ajouter des crédits
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {offers.map((offer) => (
          <button
            key={offer.amount}
            onClick={() => handleRecharge(offer.amount)}
            disabled={loading}
            className={`relative flex flex-col items-center justify-center text-center p-6 cursor-pointer rounded-3xl border-2 shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl duration-300
              ${
                offer.highlight
                  ? 'bg-gradient-to-br from-[#FF8C42] via-[#FF771F] to-[#FF5E00] text-white scale-105 border-orange-300 animate-pulse'
                  : 'bg-white/90 text-gray-800 hover:border-orange-400'
              }
            `}
          >
            {offer.tag && (
              <span className="absolute -top-4 px-3 py-1 text-sm bg-white text-orange-600 font-bold rounded-full shadow-md">
                {offer.tag}
              </span>
            )}
            <div className="text-3xl font-bold mb-2">
              {offer.amount.toLocaleString()} USD
            </div>
            <div className="text-lg font-medium">
              {offer.credits.toLocaleString()} crédits
            </div>
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin mt-2 text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
