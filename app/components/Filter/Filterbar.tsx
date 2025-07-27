'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchSection } from './SearchBar';
import { CitySection } from './cityPicker';
import { CategorySection } from './Categorypicker';
import { DonSection } from './DonSwitch';
import { Category } from '@/types/category';

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

  const baseClass = `relative flex-1 px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-200 z-10 text-gray-700`;

  // Fermer l'animation si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Position de la barre animée
  const getFieldPosition = (field: string) => {
    const el = document.querySelector(`[data-field="${field}"]`) as HTMLElement;
    if (el) {
      return { width: el.offsetWidth, left: el.offsetLeft };
    }
    return { width: 0, left: 0 };
  };

  const { width, left } = activeField
    ? getFieldPosition(activeField)
    : { width: 0, left: 0 };

  // Reset complet des filtres
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
    <div className="p-6 bg-neutral-50">
      <div
        ref={barRef}
        className={`mx-auto max-w-6xl relative flex items-center rounded-full shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 ${
          activeField ? 'bg-neutral-100' : 'bg-white'
        }`}
      >
        {/* Highlight animé */}
        {activeField && (
          <motion.div
            className="absolute top-0 bottom-0 bg-white shadow-md rounded-full"
            initial={false}
            animate={{ left, width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {/* Recherche */}
        <div
          data-field="search"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('search')}
        >
          <SearchSection search={search} setSearch={setSearch} />
        </div>

        {/* Ville */}
        <div
          data-field="city"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('city')}
        >
          <CitySection city={city} setCity={setCity} />
        </div>

        {/* Catégorie */}
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

        {/* Don */}
        <div
          data-field="don"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('don')}
        >
          <DonSection isDon={isDon} setIsDon={setIsDon} />
        </div>

        {/* Prix Min/Max */}
        <div
          data-field="price"
          className={`${baseClass} flex gap-2 border-r`}
          onClick={() => setActiveField('price')}
        >
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-16 border rounded-lg px-2 py-1 text-xs text-center"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-16 border rounded-lg px-2 py-1 text-xs text-center"
          />
        </div>

        {/* Tri */}
        <div
          data-field="sort"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('sort')}
        >
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border-none bg-transparent text-sm cursor-pointer outline-none"
          >
            <option value="desc">Prix décroissant</option>
            <option value="asc">Prix croissant</option>
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="px-4 py-1 text-xs bg-gray-100 hover:bg-gray-200 transition rounded-full ml-2"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
