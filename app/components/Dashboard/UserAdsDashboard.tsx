'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, Rows } from 'lucide-react';
import DeleteAdButton from '../Button/DeleteAdButton';
import EditAdButton from '../Button/EditAdButton';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { cn } from '@/lib/utils';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import DashboardPremiumOffers from '../Payment/DashboardPremiumOffers';
import Loader from '../Fonctionnalities/Loader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from 'usehooks-ts';

const ADS_PER_PAGE = 10;

type Ad = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  images: string[];
  boostUntil?: string | null;
};

type SortOrder = 'asc' | 'desc';

export default function UserAdsDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(total / ADS_PER_PAGE));

  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', sortOrder);
      params.append('page', String(page));
      params.append('limit', String(ADS_PER_PAGE));

      const res = await fetch(`/api/ad/user/${userId}?${params.toString()}`);
      const { data, total } = await res.json();

      setAds((prev) => (isMobile && page > 1 ? [...prev, ...data] : data));
      setTotal(total);
      setLoading(false);
    }

    fetchAds();
  }, [userId, sortOrder, page, isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && ads.length < total) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '300px' }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [ads, loading, isMobile]);

  return (
    <div className="w-full mx-auto">
      <div className="z-30 relative bg-neutral-50 backdrop-blur-xl py-5 flex items-center justify-center">
        <div className="bg-white p-5 shadow-black/10 shadow-2xl border rounded-[1.7rem] flex items-center justify-between mx-auto max-w-7xl w-full">
          <h1 className="md:text-3xl sm:text-2xl text-lg max-sm:text-center font-bold">
            Mes annonces
          </h1>
          <Button
            onClick={() => router.push('/dashboard/annonces/new')}
            style={{ background: 'linear-gradient(90deg, #ff7a00, #ff3c00)' }}
            className="flex items-center gap-2 text-white transition rounded-3xl px-6 py-3 text-lg shadow-xl"
          >
            <PlusCircle className="w-5 h-5" />
            Nouvelle annonce
          </Button>
        </div>
      </div>

      <div className="mt-8 max-w-7xl mx-auto relative">
        <div className="sticky w-fit rounded-3xl top-2 p-2 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-xl shadow-xl border z-50">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded-3xl p-2 border shadow bg-white text-gray-700 text-xs md:text-sm hover:border-gray-400 transition"
          >
            <option value="desc">Plus récentes</option>
            <option value="asc">Plus anciennes</option>
          </select>
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="rounded-2xl border bg-white p-2 shadow hover:bg-gray-50 transition"
            title="Changer la vue"
          >
            {isCompact ? <Rows size={18} /> : <LayoutGrid size={18} />}
          </button>
        </div>

        {loading && page === 1 ? (
          <Loader />
        ) : ads.length === 0 ? (
          <p className="text-gray-500 h-screen flex text-center items-center justify-center p-8">
            Aucune annonce publiée.
          </p>
        ) : (
          <>
            <div
              className={cn(
                'grid gap-5 mt-8 p-6 transition-all',
                isCompact
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              )}
            >
              <AnimatePresence mode="wait">
                {ads.map((ad) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative pb-4"
                  >
                    <div className="relative">
                      <Link href={`/annonce/${ad.id}`} target="_blank">
                        {ad.images?.[0] && (
                          <Image
                            src={ad.images[0]}
                            alt={ad.title}
                            width={300}
                            height={200}
                            className="rounded-3xl aspect-square shadow-2xl shadow-[#00000010] border border-gray-100 w-full object-cover"
                          />
                        )}
                      </Link>
                      {ad.boostUntil &&
                        new Date(ad.boostUntil) > new Date() && (
                          <div className="group absolute top-2 left-2 bg-white/90 backdrop-blur-xl mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                            <span
                              className={cn(
                                'absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]'
                              )}
                              style={{
                                WebkitMask:
                                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'subtract',
                                WebkitClipPath: 'padding-box',
                              }}
                            />
                            <AnimatedGradientText className="text-sm font-medium">
                              Boosté
                            </AnimatedGradientText>
                          </div>
                        )}
                    </div>

                    <div className="mt-2">
                      <h2 className="font-semibold text-lg line-clamp-1">
                        {ad.title}
                      </h2>
                      <div className="text-primary font-bold mt-1">
                        {ad.price?.toLocaleString()} USD
                      </div>
                      {ad.location && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {ad.location}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-3">
                      <div className="flex items-center justify-center gap-0">
                        <EditAdButton adId={ad.id} />
                        <DeleteAdButton
                          userId={userId}
                          adId={ad.id}
                          onDeleted={() =>
                            setAds((prev) => prev.filter((a) => a.id !== ad.id))
                          }
                        />
                      </div>
                      {!ad.boostUntil ||
                        (new Date(ad.boostUntil) < new Date() && (
                          <div onClick={() => setSelectedAdId(ad.id)}>
                            <InteractiveHoverButton text="Booster" />
                          </div>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isMobile && <div ref={loaderRef} className="h-12 mt-6" />}

            {!isMobile && totalPages > 1 && (
              <div className="w-full flex justify-center mb-10 mt-5">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className="rounded-2xl cursor-pointer"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`rounded-2xl cursor-pointer font-semibold transition-all ${
                            page === i + 1
                              ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-xl'
                              : 'bg-white text-gray-700 hover:bg-orange-50'
                          }`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        className="rounded-2xl cursor-pointer"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        aria-disabled={page === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {selectedAdId && (
        <DashboardPremiumOffers
          adId={selectedAdId}
          onClose={() => setSelectedAdId(null)}
        />
      )}
    </div>
  );
}
