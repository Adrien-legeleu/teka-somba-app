'use client';

import { IconSearch, IconFilter } from '@tabler/icons-react';
import { useFilter } from './FilterContext';

export default function SearchBarMobile() {
  const { search, setSearch } = useFilter();

  return (
    <div className="flex items-center bg-white border border-black/5 shadow-lg shadow-black/5 rounded-3xl p-4 w-full">
      <IconSearch size={20} className="text-gray-500 mr-2" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un article..."
        className="flex-1 text-sm outline-none bg-transparent"
      />
    </div>
  );
}
