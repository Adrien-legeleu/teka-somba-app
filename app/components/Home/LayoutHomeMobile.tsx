'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SearchBarMobile from './SearchBarMobile';
import CategoryIconList from './CategoryIconList';
import FilterModalMobile from './FilterModalMobile';
import { FilterProvider } from './FilterContext';
import FilterBar from '../Filter/Filterbar';
// Desktop FilterBar component

export default function LayoutHomeMobile({
  children,
}: {
  children: ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  // Only apply this special layout on the home page ('/')
  if (pathname !== '/') {
    return <>{children}</>;
  }

  return (
    <FilterProvider>
      <div className="w-full mx-auto pb-32">
        {isMobile ? (
          <>
            <div className="sticky top-0 z-50 bg-white shadow p-4 flex flex-col gap-4">
              <SearchBarMobile />
              <CategoryIconList />
            </div>

            <FilterModalMobile />
            <main className="px-4  relative">{children}</main>
          </>
        ) : (
          /* --- Desktop Layout: Show horizontal FilterBar and then content --- */
          <>
            <FilterBar /* FilterBar now reads context internally, no props needed */
            />

            {children}
          </>
        )}
      </div>
    </FilterProvider>
  );
}
