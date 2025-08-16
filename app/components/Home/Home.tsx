'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
  startTransition,
  CSSProperties,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin } from '@tabler/icons-react';
import { useFilter } from './FilterContext';
import { FavoriteButton } from '../Favorite/FavoriteButton';
import FilterBarDesktop from './FilterBarDesktop';
import { AnimatePresence, motion } from 'framer-motion';
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
import { Ad } from '@/types/ad';

type FetchResponse = { data: Ad[]; total: number };

const ADS_PER_PAGE = 20;
function AdCardSkeleton({ isCompact }: { isCompact: boolean }) {
  return (
    <div
      className="overflow-hidden relative"
      style={
        {
          contentVisibility: 'auto',
          containIntrinsicSize: isCompact ? '300px 330px' : '300px 380px',
          minHeight: isCompact ? 330 : 380,
        } as CSSProperties
      }
    >
      {/* image */}
      <div className="w-full aspect-square rounded-3xl bg-gray-200/70 animate-pulse" />
      {/* contenu */}
      <div className="pl-1 py-4">
        <div className="h-4 w-3/4 rounded-md bg-gray-200/70 animate-pulse" />
        <div className="mt-2 h-3 w-1/2 rounded-md bg-gray-200/60 animate-pulse" />
        <div className="mt-3 h-4 w-1/3 rounded-md bg-gray-200/70 animate-pulse" />
      </div>

      {/* faux bouton favori */}
      <div className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white shadow-md grid place-items-center">
        <div className="h-4 w-4 rounded bg-gray-200/80 animate-pulse" />
      </div>
    </div>
  );
}
function isAbortError(e: unknown): boolean {
  return (
    (e instanceof DOMException && e.name === 'AbortError') ||
    (typeof e === 'object' &&
      e !== null &&
      'name' in e &&
      (e as Record<string, unknown>).name === 'AbortError')
  );
}

function buildParams({
  categoryId,
  subCategoryId,
  city,
  search,
  isDon,
  userId,
  priceMin,
  priceMax,
  sortOrder,
  lat,
  lng,
  radius,
  page,
  limit,
}: {
  categoryId?: string | null;
  subCategoryId?: string | null;
  city?: string | null;
  search?: string | null;
  isDon?: boolean | null;
  userId?: string | null;
  priceMin?: string | null;
  priceMax?: string | null;
  sortOrder?: string | null;
  lat?: string | null;
  lng?: string | null;
  radius?: string | null;
  page: number;
  limit: number;
}) {
  const params = new URLSearchParams();
  if (subCategoryId) params.append('categoryId', subCategoryId);
  else if (categoryId) params.append('categoryId', categoryId);
  if (city) params.append('city', city);
  if (search) params.append('q', search);
  if (isDon) params.append('isDon', 'true');
  if (userId) params.append('userId', userId);
  if (priceMin !== null && priceMin !== undefined && priceMin !== '')
    params.append('priceMin', priceMin);
  if (priceMax !== null && priceMax !== undefined && priceMax !== '')
    params.append('priceMax', priceMax);
  if (sortOrder) {
    params.append('sortBy', 'price');
    params.append('sortOrder', sortOrder);
  }
  if (lat) params.append('lat', lat);
  if (lng) params.append('lng', lng);
  if (radius) params.append('radius', radius);

  params.append('page', String(page));
  params.append('limit', String(limit));
  return params.toString();
}

export default function Home({
  userId,
  initialAds,
  initialTotal,
  initialPage = 1,
}: {
  userId?: string | null;
  initialAds?: Ad[];
  initialTotal?: number;
  initialPage?: number;
}) {
  const {
    categoryId,
    subCategoryId,
    city,
    search,
    isDon,
    priceMin,
    priceMax,
    sortOrder,
    lat,
    lng,
    radius,
  } = useFilter();

  const deferredSearch = useDeferredValue(search);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [ads, setAds] = useState<Ad[]>(() => initialAds ?? []);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(
    () => !initialAds || initialAds.length === 0
  );
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(() => initialTotal ?? 0);
  const [page, setPage] = useState<number>(() => initialPage);
  const [isCompact, setIsCompact] = useState(true);

  const prefetchCache = useRef<Map<number, FetchResponse>>(new Map());

  const totalPages = Math.max(1, Math.ceil(total / ADS_PER_PAGE));

  // Clé de filtres pour reset de pagination et cache
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        categoryId,
        subCategoryId,
        city,
        deferredSearch,
        isDon,
        priceMin,
        priceMax,
        sortOrder,
        lat,
        lng,
        radius,
        userId: userId ?? null,
        isMobile,
      }),
    [
      categoryId,
      subCategoryId,
      city,
      deferredSearch,
      isDon,
      priceMin,
      priceMax,
      sortOrder,
      lat,
      lng,
      radius,
      userId,
      isMobile,
    ]
  );

  // Reset page & prefetch cache quand les filtres changent
  useEffect(() => {
    prefetchCache.current.clear();
    setPage(1);
  }, [filterKey]);

  async function fetchPage(p: number, opts?: { applyImmediately?: boolean }) {
    // Annule l’ancienne requête si une nouvelle arrive
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isInitial = p === 1 && ads.length === 0;
    if (isInitial) setLoadingInitial(true);
    else setLoadingMore(true);

    try {
      const qs = buildParams({
        categoryId,
        subCategoryId,
        city,
        search: deferredSearch ?? null,
        isDon: !!isDon,
        userId: userId ?? null,
        priceMin: priceMin ?? null,
        priceMax: priceMax ?? null,
        sortOrder: sortOrder ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
        radius: radius ?? null,
        page: p,
        limit: ADS_PER_PAGE,
      });

      const res = await fetch('/api/ad?' + qs, {
        signal: controller.signal,
        // Laisse le navigateur gérer son cache court si ton API envoie un SWR / max-age > 0
        // cache: 'no-store', // décommente si ton API renvoie du cache agressif non souhaité
        keepalive: true,
      });
      const payload: FetchResponse = await res.json();

      if (opts?.applyImmediately) {
        setAds(payload.data);
        setTotal(payload.total);
      } else {
        // Cas par défaut
        setAds(
          isMobile && p > 1
            ? (prev) => [...prev, ...payload.data]
            : payload.data
        );
        setTotal(payload.total);
      }

      return payload;
    } catch (err: unknown) {
      if (isAbortError(err)) {
        // requête annulée : on ne log pas d’erreur
        return null;
      }
      console.error('Failed to fetch ads', err);
      if (p === 1) {
        setAds([]);
        setTotal(0);
      }
      return null;
    } finally {
      if (isInitial) setLoadingInitial(false);
      else setLoadingMore(false);
    }
  }

  // Fetch principal : 1) au mount 2) quand filtres changent 3) quand page change
  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // filtres
    categoryId,
    subCategoryId,
    city,
    deferredSearch,
    isDon,
    priceMin,
    priceMax,
    sortOrder,
    userId,
    lat,
    lng,
    radius,
    // pagination + mode
    page,
    isMobile,
  ]);

  // Infinite scroll (mobile)
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingInitial &&
          !loadingMore &&
          ads.length < total
        ) {
          startTransition(() => setPage((p) => p + 1));
        }
      },
      { rootMargin: '300px' }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [ads.length, loadingInitial, loadingMore, isMobile, total]);

  // Prefetch next page (desktop) – réduit la latence quand on clique "Suivant"
  useEffect(() => {
    if (isMobile) return;
    if (page >= totalPages) return;
    const next = page + 1;
    if (!prefetchCache.current.has(next)) {
      fetchPage(next).then((resp) => {
        if (resp) prefetchCache.current.set(next, resp);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, filterKey, isMobile]);

  const goToPage = (p: number) => {
    const pref = prefetchCache.current.get(p);
    if (pref && !isMobile) {
      // Affichage instantané si on a un prefetch
      setAds(pref.data);
      setTotal(pref.total);
    }
    startTransition(() => setPage(p));
    // On laisse de toute façon le fetch “officiel” se faire pour rester à jour
  };

  return (
    <div className="w-full flex min-h-[60vh] pb-10 relative flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full"
      >
        <FilterBarDesktop />
      </motion.div>

      {/* Au lieu de masquer tout l’écran, on garde la grille visible si on a déjà des données */}
      {ads.length === 0 && loadingInitial ? (
        <div
          className={cn(
            'grid w-full gap-6 mt-6 px-4 md:px-10 transition-all duration-300 min-h-[50vh]', // 👈 ajouté
            isCompact
              ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          )}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <AdCardSkeleton key={`s-${i}`} isCompact={isCompact} />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <p className="text-center rounded-2xl mt-4 shadow-md bg-white p-10 text-gray-600">
          Aucune annonce trouvée.
        </p>
      ) : (
        <>
          {isMobile && (
            <div className="z-30 w-fit mt-4 p-2 rounded-3xl border border-black/5 bg-white shadow-lg shadow-black/5 flex items-center gap-2">
              <button
                onClick={() => setIsCompact(!isCompact)}
                className="p-2 rounded-3xl border border-black/5 bg-white shadow-lg shadow-black/5 hover:bg-gray-50 transition"
                title="Changer la vue"
              >
                {isCompact ? <Rows size={18} /> : <LayoutGrid size={18} />}
              </button>
              <span className="text-sm text-gray-600">
                {isCompact ? '2 par ligne' : '1 par ligne'}
              </span>
            </div>
          )}

          <div
            className={cn(
              'grid w-full gap-6 mt-6 px-4 md:px-10 transition-all duration-300',
              isCompact
                ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            )}
          >
            <AnimatePresence mode="popLayout">
              {ads.map((ad, i) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  viewport={{ once: true, amount: 0.15 }}
                  className="overflow-hidden relative"
                  // Rend les cartes offscreen quasi gratuites
                  style={{
                    contentVisibility:
                      'auto' as React.CSSProperties['contentVisibility'],
                    containIntrinsicSize: isCompact
                      ? '300px 330px'
                      : '300px 380px',
                  }}
                >
                  <div className="relative">
                    <Link href={`/annonce/${ad.id}`} prefetch={false}>
                      {ad.images?.[0] && (
                        <Image
                          src={ad.images[0]}
                          alt={ad.title}
                          width={1000}
                          height={800}
                          className="w-full aspect-square rounded-3xl object-cover"
                          // Optimise la taille réellement téléchargée
                          sizes={
                            isCompact
                              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw'
                              : '(max-width: 640px) 100vw, (max-width: 1024px) 33vw, (max-width:1280px) 25vw, 20vw'
                          }
                          quality={60}
                          priority={i === 0}
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                          placeholder="empty"
                        />
                      )}
                    </Link>
                    <FavoriteButton
                      userId={userId}
                      adId={ad.id}
                      isFavoriteInitial={ad.isFavorite}
                    />
                  </div>

                  <Link
                    href={`/annonce/${ad.id}`}
                    className="block pl-1 py-4"
                    prefetch={false}
                  >
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Squelette d’append (mobile) */}
          {isMobile && loadingMore && (
            <div
              className={cn(
                'grid w-full gap-6 mt-6 px-4 md:px-10',
                isCompact
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              )}
            >
              {Array.from({ length: isCompact ? 6 : 3 }).map((_, i) => (
                <AdCardSkeleton key={`append-s-${i}`} isCompact={isCompact} />
              ))}
            </div>
          )}

          {/* Pagination (desktop) */}
          {totalPages > 1 && !isMobile && (
            <div className="w-full flex justify-center mb-10 mt-5">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="rounded-2xl cursor-pointer"
                      onClick={() => goToPage(Math.max(1, page - 1))}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => goToPage(i + 1)}
                        className={cn(
                          'rounded-2xl cursor-pointer font-semibold transition-all',
                          page === i + 1
                            ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-xl'
                            : 'bg-white text-gray-700 hover:bg-orange-50'
                        )}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      className="rounded-2xl cursor-pointer"
                      onClick={() => goToPage(Math.min(totalPages, page + 1))}
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
  );
}
