'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/category';
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
        className="font-semibold text-xs cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        Catégorie
      </Label>
      <div
        className="cursor-pointer text-sm text-gray-500 flex items-center gap-1"
        onClick={() => setIsModalOpen(true)}
      >
        <span>{selectedCategory?.name || 'Catégorie'}</span>
        {selectedCategory && <span className="text-gray-400">/</span>}
        <span>
          {selectedCategory?.children?.find((s) => s.id === subCategoryId)
            ?.name || (selectedCategory ? 'Sous-catégorie' : '')}
        </span>
      </div>

      {/* ----- MOBILE VERSION (DANS LE DRAWER) ----- */}
      {isMobile && isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white rounded-t-3xl shadow-lg animate-slide-up">
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
          <div className="p-4 overflow-y-auto flex-1">
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
                      sub.id === subCategoryId ? 'bg-gray-100 font-medium' : ''
                    }`}
                    onClick={() => handleSubCategoryClick(sub)}
                  >
                    {sub.name}
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* ----- DESKTOP VERSION (PORTAL) ----- */}
      {!isMobile &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[10000] flex justify-center items-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                  className="bg-white w-[400px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg p-6"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
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
                  {!showSubCategories
                    ? categories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`p-3 rounded-xl cursor-pointer transition hover:bg-gray-100 ${
                            cat.id === categoryId
                              ? 'bg-gray-100 font-medium'
                              : ''
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
