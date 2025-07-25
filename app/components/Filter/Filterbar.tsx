'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchSection } from './SearchBar';
import { CitySection } from './cityPicker';
import { CategorySection } from './Categorypicker';
import { DonSection } from './DonSwitch';

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
}: any) {
  const [activeField, setActiveField] = useState<string | null>(null);

  return (
    <div className="z-20 relative border-b bg-neutral-50 backdrop-blur-xl py-5 flex items-center justify-center">
      <div className="bg-white px-6 py-2 rounded-full shadow-2xl shadow-black/10 border grid-4 gap-3 mx-auto max-w-5xl w-full">
        <motion.div
          layout
          className={`filter-item ${activeField === 'search' ? 'active' : ''}`}
          onClick={() => setActiveField('search')}
        >
          <SearchSection search={search} setSearch={setSearch} />
        </motion.div>

        <motion.div
          layout
          className={`filter-item ${activeField === 'city' ? 'active' : ''}`}
          onClick={() => setActiveField('city')}
        >
          <CitySection
            city={city}
            setCity={setCity}
            isActive={activeField === 'city'}
            close={() => setActiveField(null)}
          />
        </motion.div>

        <motion.div
          layout
          className={`filter-item ${activeField === 'category' ? 'active' : ''}`}
          onClick={() => setActiveField('category')}
        >
          <CategorySection
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            subCategoryId={subCategoryId}
            setSubCategoryId={setSubCategoryId}
            isActive={activeField === 'category'}
            close={() => setActiveField(null)}
          />
        </motion.div>

        <motion.div
          layout
          className={`filter-item ${activeField === 'don' ? 'active' : ''}`}
          onClick={() => setActiveField('don')}
        >
          <DonSection isDon={isDon} setIsDon={setIsDon} />
        </motion.div>
      </div>
    </div>
  );
}
