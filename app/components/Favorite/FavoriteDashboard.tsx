'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FavoriteButton } from './FavoriteButton';
import { IconMapPin } from '@tabler/icons-react';
import Loader from '../Fonctionnalities/Loader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { useMediaQuery } from 'usehooks-ts';
import { LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@/lib/utils';

type Favorite = {
  id: string;
  title: string;
  images: string[];
  price: number;
  location: string;
  isFavorite: boolean;
  category: { id: string; name: string };
};

const FAVORITES_PER_PAGE = 20;

export default function FavoriteDashboard({ userId }: { userId: string }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / FAVORITES_PER_PAGE));

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('userId', userId);
      params.append('page', String(page));
      params.append('limit', String(FAVORITES_PER_PAGE));

      const res = await fetch(`/api/favorite?${params.toString()}`);
      const { data, total } = await res.json();

      setFavorites((prev) =>
        isMobile && page > 1 ? [...prev, ...data] : data
      );
      setTotal(total);
      setLoading(false);
    }
    fetchFavorites();
    // eslint-disable-next-line
  }, [userId, page, isMobile]);

  // Infinite scroll mobile
  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && favorites.length < total) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '300px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [favorites, loading, isMobile]);
  const getColLabel = () => {
    if (isCompact) {
      if (window.innerWidth >= 1280) return '5 par ligne';
      if (window.innerWidth >= 1024) return '4 par ligne';
      if (window.innerWidth >= 768) return '3 par ligne';
      return '2 par ligne';
    }
    if (window.innerWidth >= 1280) return '4 par ligne';
    if (window.innerWidth >= 1024) return '3 par ligne';
    if (window.innerWidth >= 640) return '2 par ligne';
    return '1 par ligne';
  };
  const [colLabel, setColLabel] = useState('1 par ligne');
  useEffect(() => {
    const update = () => setColLabel(getColLabel());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isCompact]);

  if (loading && page === 1) return <Loader />;
  if (!favorites.length)
    return (
      <div className="text-gray-500 h-screen flex text-center items-center justify-center p-8">
        Aucune annonce en favori.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative top-2 z-30 w-fit mx-auto left-4 bg-white/90 shadow-xl border backdrop-blur-xl rounded-3xl px-3 py-2 mt-4 flex items-center gap-2">
        <button
          onClick={() => setIsCompact((v) => !v)}
          className="rounded-2xl border bg-white p-2 shadow hover:bg-gray-50 transition"
          title="Changer la vue"
        >
          {isCompact ? <Rows size={18} /> : <LayoutGrid size={18} />}
        </button>
        <span className="text-sm text-gray-600">{colLabel}</span>
      </div>
      <div
        className={cn(
          'grid  z-10 shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-6 sm:p-10 gap-5',
          isCompact
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {favorites.map((ad) => (
          <div key={ad.id} className="overflow-hidden relative">
            <div className="relative">
              <Link href={`/annonce/${ad.id}`}>
                {ad.images?.[0] && (
                  <Image
                    src={ad.images[0]}
                    alt={ad.title}
                    width={1000}
                    height={800}
                    className="w-full aspect-square rounded-3xl object-cover"
                  />
                )}
              </Link>
              <FavoriteButton
                userId={userId}
                adId={ad.id}
                isFavoriteInitial={ad.isFavorite}
              />
            </div>
            <Link href={`/annonce/${ad.id}`} className="block pl-1 py-4">
              <h2 className="font-semibold text-sm md:text-base line-clamp-1">
                {ad.title}
              </h2>
              {ad.location && (
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <IconMapPin size={14} className="mr-1" /> {ad.location}
                </div>
              )}
              <p className="font-semibold mt-2 text-sm md:text-base">
                {ad.price.toLocaleString()} USD
              </p>
            </Link>
          </div>
        ))}
      </div>
      {/* Infinite scroll trigger (mobile) */}
      {isMobile && <div ref={loaderRef} className="h-12 mt-6" />}
      {/* Pagination (desktop only) */}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
