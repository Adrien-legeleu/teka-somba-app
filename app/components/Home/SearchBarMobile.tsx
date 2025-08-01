'use client';

import { IconSearch, IconFilter } from '@tabler/icons-react';
import { useFilter } from './FilterContext';

export default function SearchBarMobile() {
  const { search, setSearch, setFilterModalOpen } = useFilter();

  return (
    <div className="flex items-center bg-white border shadow rounded-3xl px-4 py-2 w-full">
      <IconSearch size={20} className="text-gray-500 mr-2" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un article..."
        className="flex-1 text-sm outline-none bg-transparent"
      />
      <button
        onClick={() => setFilterModalOpen(true)}
        className="ml-2 text-orange-600"
      >
        <IconFilter size={24} />
      </button>
    </div>
  );
}
