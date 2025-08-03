'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useFilter } from './FilterContext';
import { CitySection } from '../Filter/cityPicker';
import { CategorySection } from '../Filter/Categorypicker';
import { DonSection } from '../Filter/DonSwitch';
import { useState } from 'react';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { toast } from 'sonner';
import LocationSlider from './LocationSlider';

export default function FilterDrawerMobile() {
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
    setLat,
    setLng,
    lat,
    lng,
    setRadius,
  } = useFilter();

  return (
    <>
      <Button
        variant="outline"
        className="rounded-full relative  left-6 text-sm px-4 py-2 mt-4 flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <IconAdjustmentsHorizontal size={18} />
        Filtres
      </Button>
      <LocationSlider
        radius={Number(radius) || 10}
        setRadius={(v) => setRadius(v.toString())}
        lat={lat}
        lng={lng}
        setLat={setLat}
        setLng={setLng}
      />
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-full max-w-md mx-auto p-0 bg-white rounded-t-3xl  flex flex-col">
          <div className="flex-1 flex pb-4 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4">
            {/* Header */}
            <DrawerHeader className="px-0 pt-0">
              <DrawerTitle className="text-base text-center">
                Filtres avancés
              </DrawerTitle>
            </DrawerHeader>

            {/* Contenu scrollable */}
            <div className="flex-1 flex flex-col gap-4">
              <CitySection city={city} setCity={setCity} />
              <CategorySection
                categories={categories}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                subCategoryId={subCategoryId}
                setSubCategoryId={setSubCategoryId}
              />
              <DonSection isDon={isDon} setIsDon={setIsDon} />
              <div className="flex max-xs:flex-col xs:items-center gap-2">
                <input
                  type="number"
                  placeholder="Min (USD)"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className=" border rounded-xl px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max (USD)"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className=" border rounded-xl px-3 py-2 text-sm"
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
          </div>
          {/* Footer fixé */}
          <DrawerFooter className="border-t flex bg-white p-4 space-y-2 flex-col">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Réinitialiser
            </Button>
            <DrawerClose asChild>
              <Button
                onClick={() => setOpen(false)}
                style={{
                  background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                }}
                className="w-full  text-white font-semibold"
              >
                Appliquer les filtres
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
