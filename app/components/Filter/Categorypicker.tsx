'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Category } from '@/types/category';
import { Label } from '@/components/ui/label';
import { IconChevronLeft, IconX } from '@tabler/icons-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.find((c) => c.id === categoryId) || null
  );
  const [showSubCategories, setShowSubCategories] = useState(false);

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryId(cat.id);
    setSubCategoryId('');
    setShowSubCategories(true);
  };

  const handleSubCategoryClick = (sub: Category) => {
    setSubCategoryId(sub.id);
    setIsModalOpen(false);
    setShowSubCategories(false);
  };

  return (
    <div className="relative w-full">
      <Label
        className="text-sm font-medium text-gray-700 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        Catégorie
      </Label>

      <div
        className="cursor-pointer text-sm text-gray-600 flex items-center gap-1 mt-1 px-4 py-2 rounded-3xl border border-gray-300 hover:bg-gray-50 transition"
        onClick={() => setIsModalOpen(true)}
      >
        <span>{selectedCategory?.name || 'Catégorie'}</span>
        {selectedCategory && <span className="text-gray-400">/</span>}
        <span>
          {selectedCategory?.children?.find((s) => s.id === subCategoryId)
            ?.name || (selectedCategory ? 'Sous-catégorie' : '')}
        </span>
      </div>

      {/* Affichage direct (pas de portal) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="mt-4 w-full bg-white border rounded-2xl shadow-lg z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 border-b">
              {showSubCategories ? (
                <button
                  onClick={() => setShowSubCategories(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <IconChevronLeft size={20} />
                  Retour
                </button>
              ) : (
                <h2 className="text-lg font-semibold">Catégories</h2>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <IconX size={24} />
              </button>
            </div>

            {/* LISTE */}
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {!showSubCategories
                ? categories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-xl cursor-pointer transition hover:bg-gray-100 ${
                        cat.id === categoryId ? 'bg-gray-100 font-medium' : ''
                      }`}
                      onClick={() => handleCategoryClick(cat)}
                    >
                      {cat.name}
                    </div>
                  ))
                : selectedCategory?.children?.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-3 rounded-xl cursor-pointer transition hover:bg-gray-100 ${
                        sub.id === subCategoryId
                          ? 'bg-gray-100 font-medium'
                          : ''
                      }`}
                      onClick={() => handleSubCategoryClick(sub)}
                    >
                      {sub.name}
                    </div>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
