'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

type Offer = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export default function PremiumModal({
  adId,
  onClose,
}: {
  adId: string;
  onClose: () => void;
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
      onClose();
    } else {
      toast.error(data.error || 'Erreur lors de l’achat.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-center mb-6">
            Boostez votre annonce
          </h2>
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border p-4 shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold">{offer.title}</h3>
                <p className="text-sm text-gray-600">{offer.description}</p>
                <div className="mt-2 font-bold">{offer.price} crédits</div>
                <Button
                  onClick={() => handleBuy(offer.id)}
                  disabled={loading}
                  className="mt-3 w-full bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? 'Chargement...' : 'Acheter'}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
