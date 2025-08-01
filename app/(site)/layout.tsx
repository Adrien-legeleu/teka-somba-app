'use client';

import { ReactNode, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/app/components/Header/Header';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from '@/lib/useMediaQuery';
import { FilterProvider } from '../components/Home/FilterContext';
import { log } from 'console';

const LayoutHomeMobile = dynamic(
  () => import('../components/Home/LayoutHomeMobile'),
  {
    ssr: false,
  }
);

export default function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isMobile = useMediaQuery('(max-width: 768px)');

  const showMobileHomeLayout = isMobile && isHome;
  console.log('isHome:', isHome);

  return (
    <>
      <Suspense fallback={<div>Chargement...</div>}>
        <Header />
      </Suspense>

      {/* 🔥 Injecte FilterProvider uniquement pour la home */}
      {isHome ? (
        <FilterProvider>
          <main>
            {showMobileHomeLayout ? (
              <LayoutHomeMobile>{children}</LayoutHomeMobile>
            ) : (
              children
            )}
          </main>
        </FilterProvider>
      ) : (
        <main>{children}</main>
      )}

      <Toaster />
    </>
  );
}
