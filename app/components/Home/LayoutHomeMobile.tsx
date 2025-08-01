'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SearchBarMobile from './SearchBarMobile';
import CategoryIconList from './CategoryIconList';
import FilterBar from '../Filter/Filterbar';
import FilterDrawerMobile from './FilterModalMobile';

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
    <div className="w-full mx-auto pb-32">
      {isMobile ? (
        <>
          <div className="sticky top-0 z-50 bg-white shadow p-4 flex flex-col gap-4">
            <SearchBarMobile />
            <CategoryIconList />
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
