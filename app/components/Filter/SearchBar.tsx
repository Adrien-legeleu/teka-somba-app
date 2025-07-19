'use client';
import { Input } from '@/components/ui/input';

export function SearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (val: string) => void;
}) {
  return (
    <Input
      type="text"
      placeholder="Ex: couteau pain palaiseau"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="rounded-2xl"
    />
  );
}
