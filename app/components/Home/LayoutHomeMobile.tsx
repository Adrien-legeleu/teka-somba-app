'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SearchBarMobile from './SearchBarMobile';
import CategoryIconList from './CategoryIconList';
import FilterBar from '../Filter/Filterbar';
import FilterDrawerMobile from './FilterModalMobile';
import { AnimatePresence, motion } from 'framer-motion';

export default function LayoutHomeMobile({
  children,
}: {
  children: ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  // show / hide des catégories selon la direction du scroll
  const [showCategories, setShowCategories] = useState(true);

  // Mesure de la hauteur réelle du bloc catégories pour animer proprement
  const catWrapInnerRef = useRef<HTMLDivElement | null>(null);
  const [catHeight, setCatHeight] = useState(0);

  // Mesure à l’affichage + quand la liste de catégories change
  useEffect(() => {
    const el = catWrapInnerRef.current;
    if (!el) return;

    const measure = () => setCatHeight(el.scrollHeight);
    measure();

    // re-mesure si le contenu change (ex: icônes chargées)
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  // Hide on scroll (1px suffit) → pas de seuil, pas de flicker
  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;

        if (y <= 0) {
          setShowCategories(true);
        } else if (y > lastY) {
          // vers le bas
          setShowCategories(false);
        } else if (y < lastY) {
          // vers le haut
          setShowCategories(true);
        }

        lastY = y;
        raf = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Layout spécial seulement sur la home
  if (pathname !== '/') {
    return <>{children}</>;
  }

  return (
    <div className="w-full mx-auto pb-32">
      {isMobile ? (
        <>
          {/* Header sticky */}
          <div className="sticky top-0 z-50 bg-white shadow p-4 flex flex-col gap-4">
            <h1
              className="w-full text-center text-3xl font-bold text-transparent bg-clip-text inline-block"
              style={{
                backgroundImage: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
              }}
            >
              TEKASOMBA
            </h1>

            <SearchBarMobile />

            {/* Conteneur qui ANIME la HAUTEUR (0 ↔︎ catHeight) */}
            <motion.div
              style={{ overflow: 'hidden', willChange: 'height' }}
              initial={false}
              animate={{ height: showCategories ? catHeight : 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* Contenu mesuré */}
              <div ref={catWrapInnerRef}>
                <AnimatePresence initial={false}>
                  {/* Petit fade pour la beauté, sans jouer sur la hauteur */}
                  {showCategories && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="overflow-hidden"
                    >
                      <CategoryIconList />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Reste de la page */}
          <FilterDrawerMobile />
          <main className="px-4 relative">{children}</main>
        </>
      ) : (
        <>
          <FilterBar />
          {children}
        </>
      )}
    </div>
  );
}
