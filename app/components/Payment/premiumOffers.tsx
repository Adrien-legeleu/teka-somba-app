'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Offer = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export function PremiumOffers({
  adId,
  onClose,
}: {
  adId: string;
  onClose?: () => void;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/premium-offers')
      .then((res) => res.json())
      .then(setOffers);
  }, []);

  const handleBuy = async (offerId: string) => {
    setLoading(true);
    const res = await fetch('/api/purchase-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, adId }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success('Offre appliquée avec succès.');
      onClose?.();
    } else {
      toast.error(data.error || 'Erreur lors de l’achat.');
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-lg font-bold text-center">
        Choisissez une offre Premium
      </h2>
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="rounded-lg border p-4 shadow-sm hover:shadow transition"
        >
          <h3 className="text-md font-semibold">{offer.title}</h3>
          <p className="text-sm text-gray-600">{offer.description}</p>
          <div className="mt-2 font-bold">{offer.price} crédits</div>
          <Button
            onClick={() => handleBuy(offer.id)}
            disabled={loading}
            className="mt-2 w-full"
          >
            {loading ? 'Chargement...' : 'Acheter'}
          </Button>
        </div>
      ))}
    </div>
  );
}
