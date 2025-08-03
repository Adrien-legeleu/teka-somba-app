'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMe } from '@/hooks/useMe';
import ContactSellerModal from '@/app/components/Contact/ContactSellerModal';
import TrackAdView from '@/app/components/Fonctionnalities/TrackAdView';
import SellerProfile from '@/app/components/Profil/SellerProfileDialog';
import { Ad, DynamicFieldValue } from '@/types/ad';
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
import Loader from '@/app/components/Fonctionnalities/Loader';

function formatDynamicValue(key: string, value: DynamicFieldValue) {
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'number') {
    if (
      key.toLowerCase().includes('km') ||
      key.toLowerCase().includes('kilométrage')
    )
      return `${value.toLocaleString()} km`;
    if (
      key.toLowerCase().includes('kilo') ||
      key.toLowerCase().includes('poids')
    )
      return `${value} kg`;
    return value.toLocaleString();
  }
  return String(value);
}

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
        console.log(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAd();
  }, [id]);

  if (loading || loadingMe) {
    return <Loader />;
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
  const dynamicFields =
    ad.fields?.map((field) => ({
      name: field.categoryField?.name || '',
      value: field.value,
    })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white py-10 px-4"
    >
      <TrackAdView adId={ad.id} />

      <motion.div
        className="max-w-6xl mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* IMAGE */}

          <div className="w-full max-w-[450px] mx-auto flex flex-col gap-4">
            {/* SLIDER PRINCIPAL */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-md bg-gradient-to-tr from-orange-100 to-orange-50">
              <Swiper
                modules={[Pagination, Mousewheel, Keyboard]}
                slidesPerView={1}
                spaceBetween={10}
                mousewheel={{ forceToAxis: true }}
                keyboard
                pagination={{
                  clickable: true,
                  el: '.custom-swiper-pagination',
                  bulletActiveClass: 'bg-orange-500 border-orange-600',
                  bulletClass:
                    'swiper-pagination-bullet w-3 h-3 rounded-full border-2 bg-white border-gray-300 mx-1 transition',
                }}
                className="w-full h-full"
                onSlideChange={(swiper) => setActiveImage(swiper.activeIndex)}
                initialSlide={activeImage}
              >
                {ad.images.map((src, i) => (
                  <SwiperSlide key={i}>
                    <Image
                      src={src}
                      width={800}
                      height={600}
                      alt={`image-${i}`}
                      className="object-cover w-full h-full rounded-3xl"
                      draggable={false}
                      priority={i === 0}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="custom-swiper-pagination absolute bottom-3 left-1/2 -translate-x-1/2 z-10"></div>
            </div>

            {/* MINIATURES EN DESSOUS */}
            <div className="flex gap-2 mt-1 overflow-x-auto pb-2">
              {ad.images.map((img, i) => (
                <div
                  key={i}
                  className={`h-12 w-16 min-w-[64px] rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                    activeImage === i
                      ? 'border-orange-500  '
                      : 'border-gray-200 opacity-80'
                  }`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image
                    src={img}
                    width={100}
                    height={80}
                    alt={`miniature-${i}`}
                    className="object-cover h-full w-full"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* INFOS */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {ad.title}
                  </h1>
                  <Badge
                    className="mt-2 px-4 py-1 text-sm rounded-2xl text-white"
                    style={{
                      background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                    }}
                  >
                    {ad.category?.name}
                  </Badge>
                </div>
                <ReportAdDialog adId={ad.id} />
              </div>

              {/* PRIX AVEC GRADIENT */}
              <h2
                className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                }}
              >
                {ad.isDon ||
                ad.price === 0 ||
                ad.price === null ||
                ad.price === undefined
                  ? 'GRATUIT'
                  : `${ad.price.toLocaleString()} USD`}
              </h2>

              <p className="text-md text-gray-600 mb-1">{ad.location}</p>
              {ad.durationValue && ad.durationUnit && (
                <p className="text-sm text-gray-500 mb-4">
                  Durée : {ad.durationValue} {ad.durationUnit.toLowerCase()}
                </p>
              )}
              <p className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                {ad.description}
              </p>
            </div>

            {/* VENDEUR + CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {ad.user?.avatar && (
                  <Image
                    src={ad.user.avatar}
                    width={60}
                    height={60}
                    alt="avatar"
                    className="object-cover shadow-md rounded-3xl aspect-square"
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
                  <Button
                    className="text-white font-semibold"
                    style={{
                      background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                    }}
                    onClick={() => router.push('/login')}
                  >
                    Se connecter pour contacter
                  </Button>
                ) : isSeller ? (
                  <Button
                    className="text-white font-semibold"
                    style={{
                      background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                    }}
                    onClick={() => router.push(`/dashboard/annonces/${ad.id}`)}
                  >
                    Modifier l&apos;annonce
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
      {dynamicFields.length > 0 && (
        <div className=" mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
          {dynamicFields.map((field, i) => (
            <div
              key={i}
              className="bg-neutral-50 rounded-3xl p-4 shadow-sm border border-gray-100"
            >
              <div className="text-xs uppercase text-gray-400 mb-1">
                {field.name}
              </div>
              <div className="font-medium text-gray-800">
                {formatDynamicValue(field.name, field.value)}
              </div>
            </div>
          ))}
        </div>
      )}

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
