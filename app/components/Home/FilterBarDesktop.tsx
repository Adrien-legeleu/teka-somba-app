'use client';

import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useFilter } from '../Home/FilterContext';
import { CitySection } from '../Filter/cityPicker';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { CategorySection } from '../Filter/Categorypicker';
import { DonSection } from '../Filter/DonSwitch';
import { Button } from '@/components/ui/button';

export default function FilterBarDesktop() {
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
    <div className="hidden md:flex flex-col gap-4 p-4 items-center justify-center rounded-3xl bg-neutral-50 absolute top-5 right-5 z-30 border-b border-gray-200">
      <div className="flex items-end justify-between max-w-7xl mx-auto gap-4">
        <div className="w-full max-w-xs">
          <CitySection city={city} setCity={setCity} />
        </div>

        {/* Bouton Drawer Filtres */}
        <Drawer open={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
          <DrawerTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-2 rounded-3xl bg-white border shadow-sm hover:bg-gray-100 transition text-sm font-medium text-gray-800">
              <IconAdjustmentsHorizontal size={20} />
              Filtres
            </button>
          </DrawerTrigger>

          <DrawerContent className="p-6 max-h-[90vh] overflow-y-auto rounded-t-3xl">
            <DrawerHeader>
              <DrawerTitle className="text-lg font-semibold text-gray-800">
                Filtres avancés
              </DrawerTitle>
            </DrawerHeader>

            <div className="space-y-6 max-w-xl w-full mx-auto px-1">
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
                  className="w-full rounded-3xl p-4 border shadow-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  placeholder="Max (FCFA)"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full rounded-3xl p-4 border shadow-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                />
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full rounded-3xl p-4 border shadow-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-sm"
              >
                <option value="desc">Prix décroissant</option>
                <option value="asc">Prix croissant</option>
              </select>
            </div>

            <DrawerFooter className="mt-6 max-w-xl mx-auto w-full space-y-3">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full rounded-3xl "
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setFilterModalOpen(false)}
                className="w-full rounded-3xl  bg-orange-500 hover:bg-orange-600 text-white"
              >
                Appliquer les filtres
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
