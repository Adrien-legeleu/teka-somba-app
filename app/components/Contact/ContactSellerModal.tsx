'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Ad } from '@/types/ad';
import Image from 'next/image';
import { useState } from 'react';

interface ContactSellerModalProps {
  ad: Ad;
  disabled: boolean;
  onSent?: () => void;
}

export default function ContactSellerModal({
  ad,
  disabled,
  onSent,
}: ContactSellerModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    `Bonjour, je suis intéressé(e) par "${ad.title}" à ${formatPrice(ad.price)} FCFA sur TekaSomba. Est-il toujours disponible ?`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setError(null);

    try {
      if (!ad.user) {
        setError(
          'Impossible de contacter ce vendeur (informations manquantes).'
        );
        setSending(false);
        return;
      }
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          receiverId: ad.user.id,
          content: message,
        }),
      });
      if (!res.ok) throw new Error('Erreur lors de l’envoi du message.');
      setOpen(false);
      onSent?.();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="rounded-2xl px-8 py-3 text-lg shadow-xl bg-orange-500 hover:bg-orange-600 transition"
          disabled={disabled}
        >
          Contacter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contacter le vendeur</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-3 mt-2 mb-2">
              {ad.images?.[0] && (
                <Image
                  src={ad.images[0]}
                  width={48}
                  height={48}
                  alt="image annonce"
                  className="rounded-xl object-cover"
                />
              )}
              <div>
                <div className="font-semibold text-base">{ad.title}</div>
                <div className="text-orange-600 font-bold">
                  {formatPrice(ad.price)} FCFA
                </div>
                <div className="text-sm text-gray-500">{ad.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 my-2 bg-gray-50 rounded-xl px-3 py-2">
              {ad.user?.avatar && (
                <Image
                  src={ad.user.avatar}
                  width={36}
                  height={36}
                  alt="avatar vendeur"
                  className="rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-medium">
                  {ad.user?.prenom} {ad.user?.name}
                </div>
                <div className="text-xs text-gray-500">{ad.user?.city}</div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
          >
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatPrice(price: number) {
  return price.toLocaleString('fr-FR').replace(/\s/g, ' ').replace(/,/g, ' ');
}
