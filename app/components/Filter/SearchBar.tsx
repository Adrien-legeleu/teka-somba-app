'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SearchSection({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="search" className="font-semibold text-sm">
        Recherche
      </Label>
      <Input
        type="text"
        id="search"
        placeholder="Ex: couteau pain palaiseau"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-full text-sm border-none shadow-none focus:ring-0 focus:outline-none focus:border-none bg-transparent"
      />
    </div>
  );
}
