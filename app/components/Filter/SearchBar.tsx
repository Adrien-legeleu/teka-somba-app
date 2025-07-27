'use client';

import { Label } from '@/components/ui/label';

export function SearchSection({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label htmlFor="search" className="font-semibold text-xs">
        Recherche
      </Label>
      <input
        type="text"
        id="search"
        placeholder="Ex : vélo électrique, canapé..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none shadow-none p-0"
      />
    </div>
  );
}
