'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PremiumOffers({ adId }: { adId: string }) {
  const [offers, setOffers] = useState([]);
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
    } else {
      toast.error(data.error || 'Erreur lors de l’achat.');
    }
  };

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="rounded-xl border p-4 bg-white shadow">
          <h3 className="font-semibold text-lg">{offer.title}</h3>
          <p className="text-sm text-muted-foreground">{offer.description}</p>
          <div className="mt-2 font-bold">{offer.price} crédits</div>
          <Button onClick={() => handleBuy(offer.id)} disabled={loading}>
            Acheter
          </Button>
        </div>
      ))}
    </div>
  );
}
