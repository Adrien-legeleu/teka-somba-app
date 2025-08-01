// components/FilterDrawerMobile.tsx (updated)
'use client';

import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useFilter } from './FilterContext';

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { CitySection } from '../Filter/cityPicker';
import { CategorySection } from '../Filter/Categorypicker';
import { DonSection } from '../Filter/DonSwitch';

export default function FilterDrawerMobile() {
  const {
    isFilterModalOpen,
    setFilterModalOpen,
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

  return (
    <>
      {/* Trigger Button for Mobile */}
      <Button
        variant="outline"
        className="md:hidden rounded-full text-sm px-4 py-2 ml-4 mt-4 flex items-center gap-2"
        onClick={() => setFilterModalOpen(true)}
      >
        <IconAdjustmentsHorizontal size={18} />
        Filtres
      </Button>

      {/* Drawer for Mobile Filters */}
      <Drawer open={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
        <DrawerContent className="p-4 max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-base">Filtres avancés</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-1">
            {/* City filter section */}
            <CitySection city={city} setCity={setCity} />

            {/* Category filter section (with sub-category) */}
            <CategorySection
              categories={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              subCategoryId={subCategoryId}
              setSubCategoryId={setSubCategoryId}
            />

            {/* Don (donation) switch section */}
            <DonSection isDon={isDon} setIsDon={setIsDon} />

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

            {/* Sort order dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="desc">Prix décroissant</option>
              <option value="asc">Prix croissant</option>
            </select>
          </div>

          <DrawerFooter className="mt-6 space-y-2">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Réinitialiser
            </Button>
            <Button
              onClick={() => setFilterModalOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Appliquer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
