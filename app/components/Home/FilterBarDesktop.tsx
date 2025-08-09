'use client';

import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
} from '@tabler/icons-react';
import { useFilter } from '../Home/FilterContext';
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
import LocationSlider from './LocationSlider';
import { CitySection } from '../Filter/cityPicker';

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
    radius,
    setRadius,
    setLat,
    setLng,
    lat,
    lng,
  } = useFilter();

  return (
    // Desktop seulement
    <div className="hidden md:block w-full mt-6">
      {/* La carte compacte — tout tient à l’intérieur */}
      <div className="mx-auto w-full max-w-md rounded-3xl border border-black/5 bg-neutral-50/60 backdrop-blur-md shadow-lg shadow-black/5 p-4 overflow-hidden">
        {/* Ville + chips (empilé comme mobile) */}
        <CitySection city={city} setCity={setCity} />

        <div className="mt-3 flex flex-row-reverse items-center justify-between gap-5">
          {/* Bouton Filtres en dessous, petit et bien rangé */}
          <div>
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 p-4 rounded-3xl border border-black/5 bg-white shadow-lg shadow-black/5 hover:bg-gray-50 transition text-sm font-medium text-gray-800"
                >
                  <IconAdjustmentsHorizontal size={16} />
                  Filtres
                </button>
              </DrawerTrigger>

              {/* Contenu du drawer (inchangé) */}
              <DrawerContent className="w-full mx-auto p-0 bg-white rounded-3xl flex flex-col">
                <div className="flex-1 flex flex-col overflow-y-auto px-8 pt-6 pb-2">
                  <DrawerHeader className="px-0 pt-0">
                    <DrawerTitle className="text-lg font-semibold text-gray-800 text-center">
                      Filtres avancés
                    </DrawerTitle>
                  </DrawerHeader>

                  <div className="flex-1 flex max-w-2xl w-full mx-auto flex-col gap-6 pb-10">
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
                        placeholder="Min (USD)"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="p-3 rounded-2xl border border-black/5 bg-white shadow-sm text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="number"
                        placeholder="Max (USD)"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="p-3 rounded-2xl border border-black/5 bg-white shadow-sm text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div className="relative w-full">
                      <select
                        value={sortOrder}
                        onChange={(e) =>
                          setSortOrder(e.target.value as 'asc' | 'desc')
                        }
                        className="w-full p-3 pr-10 rounded-2xl border border-black/5 shadow-sm text-sm bg-white appearance-none focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        <option value="desc">Prix décroissant</option>
                        <option value="asc">Prix croissant</option>
                      </select>
                      <IconChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <DrawerFooter className="border-t flex flex-row items-center justify-center bg-white p-6 gap-5">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="rounded-3xl text-sm"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    onClick={() => setOpen(false)}
                    className="rounded-3xl bg-orange-500 hover:bg-orange-600 text-white text-sm"
                  >
                    Appliquer les filtres
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Slider distance en bas, compact */}
          <div>
            <LocationSlider
              radius={Number(radius) || 10}
              setRadius={(v) => setRadius(v.toString())}
              lat={lat}
              lng={lng}
              setLat={setLat}
              setLng={setLng}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
