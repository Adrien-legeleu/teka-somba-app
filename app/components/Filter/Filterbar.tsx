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
}: FilterBarProps) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const baseClass = `relative flex-1 px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-200 z-10`;

  // Ferme le focus si clic en dehors
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
    if (el) {
      return { width: el.offsetWidth, left: el.offsetLeft };
    }
    return { width: 0, left: 0 };
  };

  const { width, left } = activeField
    ? getFieldPosition(activeField)
    : { width: 0, left: 0 };

  return (
    <div className="p-10 bg-neutral-50">
      <div
        ref={barRef}
        className={`mx-auto max-w-5xl py-1 grid-4 relative flex rounded-full shadow-lg overflow-hidden border border-black/20
        ${activeField ? 'bg-neutral-100' : 'bg-white'}`}
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
          className={`${baseClass} border-r `}
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
          className={baseClass}
          onClick={() => setActiveField('don')}
        >
          <DonSection isDon={isDon} setIsDon={setIsDon} />
        </div>
      </div>
    </div>
  );
}
