'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFilter } from '../Home/FilterContext';
import { SearchSection } from './SearchBar';
import { CitySection } from './cityPicker';
import { CategorySection } from './Categorypicker';
import { DonSection } from './DonSwitch';

export default function FilterBar() {
  const {
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
    resetFilters,
  } = useFilter();

  const [activeField, setActiveField] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const baseClass =
    'relative flex-1 px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-200 z-10 text-gray-700';

  // Close any open popover when clicking outside the filter bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate highlight position for active field indicator
  const getFieldPosition = (field: string) => {
    const el = document.querySelector(`[data-field="${field}"]`) as HTMLElement;
    if (el) return { width: el.offsetWidth, left: el.offsetLeft };
    return { width: 0, left: 0 };
  };

  const { width, left } = activeField
    ? getFieldPosition(activeField)
    : { width: 0, left: 0 };

  return (
    <div className="p-6 bg-neutral-50 space-y-4">
      {/* --- Desktop Filters Bar --- */}
      <div
        ref={barRef}
        className={`hidden md:flex mx-auto max-w-5xl relative items-center rounded-full shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 ${
          activeField ? 'bg-neutral-100' : 'bg-white'
        }`}
      >
        {/* Animated background highlight for active field */}
        {activeField && (
          <motion.div
            className="absolute top-0 bottom-0 bg-white shadow-md rounded-full"
            initial={false}
            animate={{ left, width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        {/* Search field (click to activate) */}
        <div
          data-field="search"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('search')}
        >
          <SearchSection search={search} setSearch={setSearch} />
        </div>
        {/* City field */}
        <div
          data-field="city"
          className={`${baseClass} border-r`}
          onClick={() => setActiveField('city')}
        >
          <CitySection city={city} setCity={setCity} />
        </div>
        {/* Category field */}
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
        {/* Donation (Don) field */}
        <div
          data-field="don"
          className={baseClass}
          onClick={() => setActiveField('don')}
        >
          <DonSection isDon={isDon} setIsDon={setIsDon} />
        </div>
      </div>

      {/* Desktop additional filters (price range, sort, reset) */}
      <div className="hidden md:flex items-center gap-4 max-w-5xl mx-auto bg-white border border-gray-200 shadow-md rounded-full p-4">
        {/* Price range inputs */}
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
        {/* Sort order select */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="border rounded-lg px-3 py-1 text-sm bg-white cursor-pointer"
        >
          <option value="desc">Prix décroissant</option>
          <option value="asc">Prix croissant</option>
        </select>
        {/* Reset filters button */}
        <button
          onClick={resetFilters}
          className="ml-auto px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
