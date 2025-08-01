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
      <Button
        variant="outline"
        className="md:hidden rounded-full text-sm px-4 py-2 ml-4 mt-4 flex items-center gap-2"
        onClick={() => setFilterModalOpen(true)}
      >
        <IconAdjustmentsHorizontal size={18} />
        Filtres
      </Button>

      <Drawer open={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
        <DrawerContent className="h-[90vh] z-[10000000000] flex flex-col p-0">
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <DrawerHeader>
              <DrawerTitle className="text-base">Filtres avancés</DrawerTitle>
            </DrawerHeader>

            <CitySection city={city} setCity={setCity} />

            <CategorySection
              categories={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              subCategoryId={subCategoryId}
              setSubCategoryId={setSubCategoryId}
            />

            <DonSection isDon={isDon} setIsDon={setIsDon} />

            {/* Price */}
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

            {/* Tri */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="desc">Prix décroissant</option>
              <option value="asc">Prix croissant</option>
            </select>
          </div>

          {/* Footer fixé en bas */}
          <DrawerFooter className="border-t bg-white p-4 space-y-2 rounded-b-2xl">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Réinitialiser
            </Button>
            <Button
              onClick={() => setFilterModalOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Appliquer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
