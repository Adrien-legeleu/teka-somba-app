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
import { useState } from 'react';

export default function FilterBarDesktop() {
  const [open, setOpen] = useState(false);
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
  } = useFilter();

  return (
    <div className="hidden md:flex flex-col gap-4 p-4 items-center justify-center rounded-3xl shadow-2xl shadow-black/10 border bg-neutral-50/60 backdrop-blur-xl absolute top-5 right-5 z-30 border-b border-gray-200">
      <div className="flex items-end justify-between max-w-7xl mx-auto gap-4">
        <div className="w-full max-w-xs">
          <CitySection city={city} setCity={setCity} />
        </div>

        {/* Drawer Filtres Desktop */}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-3xl bg-white border shadow-sm hover:bg-gray-100 transition text-sm font-medium text-gray-800"
            >
              <IconAdjustmentsHorizontal size={20} />
              Filtres
            </button>
          </DrawerTrigger>

          <DrawerContent className="w-full  mx-auto p-0 bg-white rounded-3xl flex flex-col ">
            <div className="flex-1 flex flex-col overflow-y-auto px-8 pt-6 pb-2">
              {/* Header */}
              <DrawerHeader className="px-0 pt-0">
                <DrawerTitle className="text-lg font-semibold text-gray-800 text-center">
                  Filtres avancés
                </DrawerTitle>
              </DrawerHeader>

              {/* Contenu scrollable */}
              <div className="flex-1 flex max-w-2xl w-full mx-auto flex-col gap-6 pb-5">
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
                  onChange={(e) =>
                    setSortOrder(e.target.value as 'asc' | 'desc')
                  }
                  className="w-full rounded-3xl p-4 border shadow-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-sm"
                >
                  <option value="desc">Prix décroissant</option>
                  <option value="asc">Prix croissant</option>
                </select>
              </div>
            </div>

            {/* Footer fixé */}
            <DrawerFooter className="border-t flex flex-row items-center justify-center  bg-white p-6 gap-5">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="rounded-3xl"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="rounded-3xl bg-orange-500 hover:bg-orange-600 text-white"
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
