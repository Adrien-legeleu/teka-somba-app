'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/category';

export function CategorySection({
  categories,
  categoryId,
  setCategoryId,
  subCategoryId,
  setSubCategoryId,
}: {
  categories: Category[];
  categoryId: string;
  setCategoryId: (val: string) => void;
  subCategoryId: string;
  setSubCategoryId: (val: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [openCat, setOpenCat] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [searchCat, setSearchCat] = useState('');
  const [searchSub, setSearchSub] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.find((c) => c.id === categoryId) || null
  );

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenCat(false);
        setOpenSub(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryId(cat.id);
    setSubCategoryId('');
    setOpenSub(true);
  };

  const handleSubCategoryClick = (sub: Category) => {
    setSubCategoryId(sub.id);
    setOpenCat(false);
    setOpenSub(false);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCat.toLowerCase())
  );
  const filteredSubCategories =
    selectedCategory?.children?.filter((sub) =>
      sub.name.toLowerCase().includes(searchSub.toLowerCase())
    ) || [];

  return (
    <div ref={wrapRef} className="relative w-full">
      <Label
        className="font-semibold text-sm cursor-pointer"
        onClick={() => {
          setOpenCat(true);
          setOpenSub(false);
        }}
      >
        Catégorie
      </Label>
      <div
        className="cursor-pointer text-sm text-gray-500 flex items-center gap-1"
        onClick={() => {
          setOpenCat(true);
          setOpenSub(false);
        }}
      >
        <span>{selectedCategory?.name || 'Catégorie'}</span>
        {selectedCategory && <span className="text-gray-400">/</span>}
        <span>
          {selectedCategory?.children?.find((s) => s.id === subCategoryId)
            ?.name || (selectedCategory ? 'Sous-catégorie' : '')}
        </span>
      </div>

      {/* PORTAL - Catégories */}
      {createPortal(
        <AnimatePresence>
          {openCat && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 30 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bg-white shadow-md rounded-3xl p-5 z-[9999] max-h-[300px] overflow-y-auto"
              style={{
                top:
                  (wrapRef.current?.getBoundingClientRect().bottom ?? 0) +
                  window.scrollY,
                left:
                  (wrapRef.current?.getBoundingClientRect().left ?? 0) +
                  window.scrollX,
                width: wrapRef.current?.offsetWidth ?? 250,
              }}
            >
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-2 rounded-xl transition cursor-pointer hover:bg-gray-100 ${
                    cat.id === categoryId ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(cat);
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* PORTAL - Sous-catégories */}
      {createPortal(
        <AnimatePresence>
          {openSub && selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 30 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bg-white shadow-md rounded-3xl p-5 z-[9999] max-h-[300px] overflow-y-auto"
              style={{
                top:
                  (wrapRef.current?.getBoundingClientRect().bottom ?? 0) +
                  window.scrollY,
                left:
                  (wrapRef.current?.getBoundingClientRect().right ?? 0) +
                  window.scrollX +
                  10, // petit décalage à droite
                width: wrapRef.current?.offsetWidth ?? 250,
              }}
            >
              {filteredSubCategories.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-2 rounded-xl transition cursor-pointer hover:bg-gray-100 ${
                    sub.id === subCategoryId ? 'bg-gray-100 font-medium' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubCategoryClick(sub);
                  }}
                >
                  {sub.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
