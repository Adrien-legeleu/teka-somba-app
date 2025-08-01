'use client';

import { ReactNode, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/app/components/Header/Header';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from '@/lib/useMediaQuery';
import { FilterProvider } from '../components/Home/FilterContext';
import Loader from '../components/Fonctionnalities/Loader';

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

  return (
    <div>
      <Suspense fallback={<Loader />}>
        <Header />
      </Suspense>

      {isHome ? (
        <Suspense>
          <FilterProvider>
            <main className="max-w-7xl mx-auto">
              {showMobileHomeLayout ? (
                <LayoutHomeMobile>{children}</LayoutHomeMobile>
              ) : (
                children
              )}
            </main>
          </FilterProvider>
        </Suspense>
      ) : (
        <main>{children}</main>
      )}

      <Toaster />
    </div>
  );
}
