'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SearchBarMobile from './SearchBarMobile';
import CategoryIconList from './CategoryIconList';
import FilterBar from '../Filter/Filterbar';
import FilterDrawerMobile from './FilterModalMobile';
import { motion, AnimatePresence } from 'framer-motion';

export default function LayoutHomeMobile({
  children,
}: {
  children: ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  const [showCategories, setShowCategories] = useState(true);
  const lastScrollY = useRef(0);
  const threshold = 10; // évite les micro-déclenchements

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si la différence est trop faible, on ignore
      if (Math.abs(currentScrollY - lastScrollY.current) < threshold) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowCategories(false); // Scroll vers le bas
      } else {
        setShowCategories(true); // Scroll vers le haut
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname !== '/') {
    return <>{children}</>;
  }

  return (
    <div className="w-full mx-auto pb-32">
      {isMobile ? (
        <>
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

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  key="categories"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <CategoryIconList />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
