'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchSection } from './SearchBar';
import { CitySection } from './cityPicker';
import { CategorySection } from './Categorypicker';
import { DonSection } from './DonSwitch';
import { Category } from '@/types/category';
import { IconFilter } from '@tabler/icons-react';

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  categories: Category[];
  categoryId: string;
  setCategoryId: (id: string) => void;
  subCategoryId: string;
  setSubCategoryId: (id: string) => void;
  isDon: boolean;
  setIsDon: (value: boolean) => void;
  priceMin: string;
  setPriceMin: (value: string) => void;
  priceMax: string;
  setPriceMax: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export default function FilterBar({
  search,
  setSearch,
  city,
  setCity,
  categories,
  categoryId,
  setCategoryId,
  subCategoryId,
  setSubCategoryId,
  isDon,
  setIsDon,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  sortOrder,
  setSortOrder,
}: FilterBarProps) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const baseClass =
    'relative flex-1 px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-200 z-10 text-gray-700';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getFieldPosition = (field: string) => {
    const el = document.querySelector(`[data-field="${field}"]`) as HTMLElement;
    if (el) return { width: el.offsetWidth, left: el.offsetLeft };
    return { width: 0, left: 0 };
  };

  const { width, left } = activeField
    ? getFieldPosition(activeField)
    : { width: 0, left: 0 };

  const resetFilters = () => {
    setSearch('');
    setCity('');
    setCategoryId('');
    setSubCategoryId('');
    setIsDon(false);
    setPriceMin('');
    setPriceMax('');
    setSortOrder('desc');
    setActiveField(null);
  };

  return (
    <div className="p-6 bg-neutral-50 space-y-4">
      {/* --- Desktop Filters --- */}
      <div
        ref={barRef}
        className={`hidden md:flex mx-auto max-w-5xl relative items-center rounded-full shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 ${
          activeField ? 'bg-neutral-100' : 'bg-white'
        }`}
      >
        {activeField && (
          <motion.div
            className="absolute top-0 bottom-0 bg-white shadow-md rounded-full"
            initial={false}
            animate={{ left, width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <div
          data-field="search"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('search')}
        >
          <SearchSection search={search} setSearch={setSearch} />
        </div>
        <div
          data-field="city"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('city')}
        >
          <CitySection city={city} setCity={setCity} />
        </div>
        <div
          data-field="category"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('category')}
        >
          <CategorySection
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            subCategoryId={subCategoryId}
            setSubCategoryId={setSubCategoryId}
          />
        </div>
        <div
          data-field="don"
          className={baseClass}
          onClick={() => setActiveField('don')}
        >
          <DonSection isDon={isDon} setIsDon={setIsDon} />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 max-w-5xl mx-auto bg-white border border-gray-200 shadow-md rounded-full p-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Prix min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-24 border rounded-lg px-2 py-1 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Prix max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-24 border rounded-lg px-2 py-1 text-sm"
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="border rounded-lg px-3 py-1 text-sm bg-white cursor-pointer"
        >
          <option value="desc">Prix décroissant</option>
          <option value="asc">Prix croissant</option>
        </select>
        <button
          onClick={resetFilters}
          className="ml-auto px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          Réinitialiser
        </button>
      </div>

      {/* --- Mobile Filters with Drawer --- */}
      <div className="md:hidden ">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-full shadow-md">
              <IconFilter size={20} /> Filtres
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-6 max-h-[85vh] z-[10000000] ">
            <DrawerHeader>
              <DrawerTitle>Tous les filtres</DrawerTitle>
            </DrawerHeader>

            {/* --- Filters Content --- */}
            <div className="space-y-4  overflow-y-auto">
              <SearchSection search={search} setSearch={setSearch} />
              <CitySection city={city} setCity={setCity} />
              <CategorySection
                categories={categories}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                subCategoryId={subCategoryId}
                setSubCategoryId={setSubCategoryId}
              />
              <DonSection isDon={isDon} setIsDon={setIsDon} />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Prix min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-24 border rounded-lg px-2 py-1 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Prix max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-24 border rounded-lg px-2 py-1 text-sm"
                />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
              >
                <option value="desc">Prix décroissant</option>
                <option value="asc">Prix croissant</option>
              </select>

              {/* Buttons */}
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
              <DrawerClose asChild>
                <Button className="w-full bg-orange-500 text-white">
                  Appliquer
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
