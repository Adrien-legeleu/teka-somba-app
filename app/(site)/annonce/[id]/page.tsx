'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMe } from '@/hooks/useMe';
import ContactSellerModal from '@/app/components/Contact/ContactSellerModal';
import TrackAdView from '@/app/components/Fonctionnalities/TrackAdView';
import SellerProfile from '@/app/components/Profil/SellerProfileDialog';
import { Ad } from '@/types/ad';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ReportAdDialog from '@/app/components/Fonctionnalities/ReportDialog';

export default function AdDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { me, loading: loadingMe } = useMe();
  const [showAdminDeleteModal, setShowAdminDeleteModal] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-white">
        <div className="max-w-4xl w-full mx-auto p-10 bg-white rounded-3xl shadow-2xl">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-96 w-full rounded-2xl mt-6" />
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="p-10 bg-white rounded-3xl shadow-xl text-xl font-semibold">
          Annonce introuvable.
        </div>
      </div>
    );
  }

  const isSeller = me?.id === ad.user?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-white to-orange-50 py-10 px-4"
    >
      <TrackAdView adId={ad.id} />

      <motion.div
        className="max-w-6xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="relative w-full rounded-3xl overflow-hidden shadow-md">
              <Image
                src={ad.images?.[activeImage]}
                width={800}
                height={800}
                alt={`image-${activeImage}`}
                className="object-cover h-full w-full rounded-3xl transition-transform duration-500 hover:scale-105"
              />
              {ad.images?.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {ad.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-3 h-3 rounded-full border-2 ${
                        activeImage === i
                          ? 'bg-orange-500 border-orange-600'
                          : 'bg-white border-gray-300'
                      } transition`}
                    />
                  ))}
                </div>
              )}
            </div>

            {ad.images?.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {ad.images.map((img, i) => (
                  <div
                    key={i}
                    className={`h-16 w-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                      activeImage === i
                        ? 'border-orange-500 shadow-md'
                        : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(i)}
                  >
                    <Image
                      src={img}
                      width={500}
                      height={500}
                      alt={`miniature-${i}`}
                      className="object-cover h-full w-full hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-cnter gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {ad.title}
                  </h1>
                  <Badge className="px-4 py-1 text-sm rounded-2xl bg-orange-100 text-orange-800">
                    {ad.category?.name}
                  </Badge>
                </div>
                <ReportAdDialog adId={ad.id} />
              </div>
              <p className="text-2xl text-orange-600 font-semibold mb-2">
                {ad.price?.toLocaleString()} FCFA
              </p>
              <p className="text-md text-gray-600 mb-3">{ad.location}</p>
              {ad.durationValue && ad.durationUnit && (
                <p className="text-sm text-gray-500 mb-4">
                  Durée : {ad.durationValue} {ad.durationUnit.toLowerCase()}
                </p>
              )}
              <p className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                {ad.description}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {ad.user?.avatar && (
                  <Image
                    src={ad.user.avatar}
                    width={60}
                    height={60}
                    alt="avatar"
                    className="rounded-full object-cover shadow-md"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {ad.user?.prenom || 'Utilisateur'} {ad.user?.name || ''}
                  </p>
                  <p className="text-xs text-gray-500">Vendeur</p>
                </div>
              </div>

              <div>
                {!me ? (
                  <Button onClick={() => router.push('/login')}>
                    Se connecter pour contacter
                  </Button>
                ) : isSeller ? (
                  <Button
                    onClick={() => router.push(`/dashboard/annonces/${ad.id}`)}
                  >
                    Modifier l'annonce
                  </Button>
                ) : (
                  <ContactSellerModal
                    ad={ad}
                    disabled={false}
                    onSent={() => router.push('/dashboard/messages')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto mt-8">
        <SellerProfile user={ad.user} ad={ad} />
      </div>

      {me?.isAdmin && (
        <div className="mt-10 text-center">
          <Button
            variant="destructive"
            onClick={() => setShowAdminDeleteModal(true)}
          >
            Supprimer en tant qu’admin
          </Button>
        </div>
      )}

      <Dialog
        open={showAdminDeleteModal}
        onOpenChange={setShowAdminDeleteModal}
      >
        <DialogContent className="max-w-md w-[90%] rounded-3xl z-[1000000000]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Supprimer cette annonce ?
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L’annonce sera supprimée et un
              email sera envoyé à l’utilisateur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex max-sm:flex-col justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowAdminDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const res = await fetch('/api/admin/moderate-ad', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ adId: ad.id, action: 'delete' }),
                });
                if (res.ok) {
                  toast.success('Annonce supprimée.');
                  router.push('/dashboard');
                } else {
                  toast.error('Erreur lors de la suppression.');
                }
              }}
            >
              Confirmer la suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
