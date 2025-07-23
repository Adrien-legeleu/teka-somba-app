'use client';
import { useState } from 'react';

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

  return (
    <div className="p-4 rounded-lg shadow bg-white max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-center">Ajouter des crédits</h2>
      <button
        onClick={() => handleRecharge(5000)}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        5 000 FCFA → 5 000 crédits
      </button>
      <button
        onClick={() => handleRecharge(10000)}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        10 000 FCFA → 10 000 crédits
      </button>
      <button
        onClick={() => handleRecharge(15000)}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        15 000 FCFA → 17 500 crédits (offre spéciale)
      </button>
    </div>
  );
}
