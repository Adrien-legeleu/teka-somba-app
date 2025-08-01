'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useFilter } from './FilterContext';

import { CitySection } from '../Filter/cityPicker';
import { CategorySection } from '../Filter/Categorypicker';
import { DonSection } from '../Filter/DonSwitch';

export default function FilterDrawerMobile() {
  const {
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
    isFilterModalOpen,
    setFilterModalOpen,
  } = useFilter();

  return (
    <Drawer open={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
      <DrawerContent className="max-h-[90vh] h-[90vh]">
        <div className="mx-auto w-full max-w-sm flex flex-col h-full">
          {/* Header */}
          <DrawerHeader>
            <DrawerTitle className="text-base">Filtres avancés</DrawerTitle>
          </DrawerHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
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
                placeholder="Min (FCFA)"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max (FCFA)"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="desc">Prix décroissant</option>
              <option value="asc">Prix croissant</option>
            </select>
          </div>

          {/* Footer fixe */}
          <DrawerFooter className="border-t bg-white p-4 space-y-2">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Réinitialiser
            </Button>
            <DrawerClose asChild>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                Appliquer les filtres
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
