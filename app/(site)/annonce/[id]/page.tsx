'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Pagination, Mousewheel, Keyboard, Thumbs } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

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
import Loader from '@/app/components/Fonctionnalities/Loader';

/* helpers */
function isMeaningful(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    return s !== '' && s !== 'null' && s !== 'undefined' && s !== 'nan';
  }
  if (typeof value === 'number') return !Number.isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
}
function formatDynamicValue(key: string, value: unknown) {
  if (!isMeaningful(value)) return '';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'number') {
    const k = key.toLowerCase();
    if (k.includes('km') || k.includes('kilométrage'))
      return `${value.toLocaleString()} km`;
    if (k.includes('kilo') || k.includes('poids')) return `${value} kg`;
    return value.toLocaleString();
  }
  return String(value);
}

export default function AdDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  // sliders sync
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const { me, loading: loadingMe } = useMe();
  const [showAdminDeleteModal, setShowAdminDeleteModal] = useState(false);

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch(`/api/ad/${id}`);
        const data = (await res.json()) as Ad;
        setAd(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAd();
  }, [id]);

  if (loading || loadingMe) return <Loader />;

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
    ad.fields
      ?.map((f) => ({
        name: f.categoryField?.name || '',
        value: f.value,
        display: formatDynamicValue(f.categoryField?.name || '', f.value),
      }))
      .filter((f) => f.name.trim() !== '' && f.display !== '') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white py-8 md:py-10 px-3 md:px-4"
    >
      <TrackAdView adId={(ad as unknown as { id: string }).id} />

      <motion.div
        className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-3xl shadow-2xl border border-gray-100"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* ----------- MEDIA ----------- */}
          <div className="flex flex-col">
            {/* Slider principal : carré 1/1, pas d'espace blanc */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-md">
              <div className="relative w-full aspect-square">
                <Swiper
                  modules={[Pagination, Mousewheel, Keyboard, Thumbs]}
                  slidesPerView={1}
                  mousewheel={{ forceToAxis: true }}
                  keyboard
                  pagination={{
                    clickable: true,
                    bulletActiveClass:
                      'bg-orange-500 border-orange-600 !opacity-100',
                    bulletClass:
                      'swiper-pagination-bullet w-2.5 h-2.5 rounded-full border bg-white/90 border-gray-300 mx-1 opacity-70 transition',
                  }}
                  onSwiper={setMainSwiper}
                  thumbs={
                    thumbsSwiper
                      ? { swiper: thumbsSwiper }
                      : ({} as { swiper: SwiperClass })
                  }
                  onSlideChange={(s) => {
                    setActiveImage(s.activeIndex);
                    // garde les thumbs centrées sur l’active
                    thumbsSwiper?.slideTo(s.activeIndex);
                  }}
                  className="absolute inset-0"
                >
                  {ad.images.map((src, i) => (
                    <SwiperSlide
                      key={i}
                      className="relative overflow-x-scroll w-full h-full"
                    >
                      <div className="relative w-full h-full aspect-square">
                        <Image
                          src={src}
                          alt={`image-${i}`}
                          fill
                          className="object-cover rounded-3xl"
                          priority={i === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* pagination bullets (positionnée proprement) */}
                <div className="swiper-pagination !bottom-3" />
              </div>
            </div>

            {/* Thumbnails carrées, synchronisées */}
            <div className="mt-4">
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[Thumbs]}
                slidesPerView={4}
                spaceBetween={10}
                watchSlidesProgress
                breakpoints={{
                  360: { slidesPerView: 5, spaceBetween: 10 },
                  640: { slidesPerView: 6, spaceBetween: 12 },
                  1024: { slidesPerView: 6, spaceBetween: 12 },
                }}
                className="w-full"
              >
                {ad.images.map((img, i) => (
                  <SwiperSlide key={i} className="!w-auto">
                    <button
                      type="button"
                      aria-label={`Aller à l’image ${i + 1}`}
                      onClick={() => {
                        setActiveImage(i);
                        mainSwiper?.slideTo(i);
                      }}
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-3xl overflow-hidden border-2 transition-all ${
                        activeImage === i
                          ? 'border-orange-500 shadow-md'
                          : 'border-gray-200 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`miniature-${i}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        draggable={false}
                        priority={i === 0}
                      />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* ----------- INFOS ----------- */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
                    {ad.title}
                  </h1>
                  <Badge
                    className="mt-2 px-4 py-1 text-sm rounded-3xl text-white"
                    style={{
                      background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                    }}
                  >
                    {ad.category?.name}
                  </Badge>
                </div>
                <ReportAdDialog adId={(ad as unknown as { id: string }).id} />
              </div>

              <h2
                className="text-2xl md:text-3xl font-extrabold mb-2 bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                }}
              >
                {ad.isDon || ad.price === 0
                  ? 'GRATUIT'
                  : `${ad.price.toLocaleString()} USD`}
              </h2>

              <p className="text-sm md:text-base text-gray-600 mb-1">
                {ad.location}
              </p>
              {ad.durationValue && ad.durationUnit && (
                <p className="text-sm text-gray-500 mb-4">
                  Durée : {ad.durationValue} {ad.durationUnit.toLowerCase()}
                </p>
              )}
              <p className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                {ad.description}
              </p>
            </div>

            {/* Vendeur + CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                {ad.user?.avatar ? (
                  <div className="relative w-[64px] h-[64px] rounded-3xl overflow-hidden shadow-md">
                    <Image
                      src={ad.user.avatar}
                      alt="avatar"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-[64px] h-[64px] rounded-3xl shadow-md bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                    {ad.user?.prenom?.[0]?.toUpperCase() ||
                      ad.user?.name?.[0]?.toUpperCase() ||
                      'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {ad.user?.prenom || 'Utilisateur'} {ad.user?.name || ''}
                  </p>
                  <p className="text-xs text-gray-500">Vendeur</p>
                </div>
              </div>

              {/* CTA */}
              {!me ? (
                <Button
                  className="text-white font-semibold rounded-3xl w-full sm:w-auto"
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  onClick={() => router.push('/login')}
                >
                  Se connecter pour contacter
                </Button>
              ) : isSeller ? (
                <Button
                  className="text-white font-semibold rounded-3xl w-full sm:w-auto"
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  onClick={() =>
                    router.push(
                      `/dashboard/annonces/${(ad as unknown as { id: string }).id}`
                    )
                  }
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
      </motion.div>

      {/* Champs dynamiques */}
      {dynamicFields.length > 0 && (
        <div className="mt-8 md:mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
          {dynamicFields.map((field, i) => (
            <div
              key={i}
              className="bg-neutral-50 rounded-3xl p-4 shadow-sm border border-gray-100"
            >
              <div className="text-xs uppercase text-gray-400 mb-1">
                {field.name}
              </div>
              <div className="font-medium text-gray-800">{field.display}</div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-8">
        <SellerProfile user={ad.user} ad={ad} />
      </div>

      {me?.isAdmin && (
        <AdminDelete
          open={showAdminDeleteModal}
          onOpenChange={setShowAdminDeleteModal}
          adId={(ad as unknown as { id: string }).id}
          afterDelete={() => router.push('/dashboard')}
        />
      )}
    </motion.div>
  );
}

/* ----------- Sous-composant : confirmation suppression ----------- */
function AdminDelete({
  open,
  onOpenChange,
  adId,
  afterDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  adId: string;
  afterDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90%] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Supprimer cette annonce ?
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. L’annonce sera supprimée et un email
            sera envoyé à l’utilisateur.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex max-sm:flex-col justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const res = await fetch('/api/admin/moderate-ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId, action: 'delete' }),
              });
              if (res.ok) {
                toast.success('Annonce supprimée.');
                afterDelete();
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
  );
}
