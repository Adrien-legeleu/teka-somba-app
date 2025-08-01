'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SearchBarMobile from './SearchBarMobile';
import CategoryIconList from './CategoryIconList';
import { FilterProvider, useFilter } from './FilterContext';
import FilterBar from '../Filter/Filterbar';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import FilterDrawerMobile from './FilterModalMobile';
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
  const { setFilterModalOpen } = useFilter();

  return (
    <FilterProvider>
      <div className="w-full mx-auto pb-32">
        {isMobile ? (
          <>
            <div className="sticky top-0 z-50 bg-white shadow p-4 flex flex-col gap-4">
              <SearchBarMobile />
              <CategoryIconList />
            </div>
            <Button
              variant="outline"
              className="rounded-full relative left-6 text-sm px-4 py-2 mt-2 flex items-center gap-2"
              onClick={() => setFilterModalOpen(true)}
            >
              <IconAdjustmentsHorizontal size={18} />
              Filtres
            </Button>

            {/* Drawer uniquement, sans trigger interne */}
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
    </FilterProvider>
  );
}
