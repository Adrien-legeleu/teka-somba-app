'use client';

import { useEffect, useState } from 'react';
import { Category } from '@prisma/client';
import clsx from 'clsx';

type Props = {
  categoryId: string | null;
  setCategoryId: (value: string) => void;
  subCategoryId: string | null;
  setSubCategoryId: (value: string) => void;
};

type CategoryWithChildren = Category & {
  children: Category[];
};

const emojiMap: Record<string, string> = {
  Véhicules: '🚗',
  Immobilier: '🏠',
  Mode: '👕',
  'High-Tech': '💻',
  'Maison & Jardin': '🏡',
  Loisirs: '🎮',
  Emploi: '💼',
  Services: '🔧',
  Animaux: '🐕',
  Autres: '📦',
};

export const CategoryPicker = ({
  categoryId,
  setCategoryId,
  subCategoryId,
  setSubCategoryId,
}: Props) => {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);
  useEffect(() => {
    if (!categoryId && subCategoryId) {
      for (const parent of categories) {
        const match = parent.children.find(
          (child) => child.id === subCategoryId
        );
        if (match) {
          setCategoryId(parent.id);
          break;
        }
      }
    }
  }, [subCategoryId, categoryId, categories]);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-3">Informations générales</h2>
        <p className="text-sm text-gray-600 mb-2">Choisissez une catégorie *</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoryId(cat.id);
                setSubCategoryId('');
              }}
              className={clsx(
                'border rounded-3xl px-4 py-3 text-center hover:border-black transition',
                categoryId === cat.id
                  ? 'border-black shadow'
                  : 'border-gray-300'
              )}
            >
              <div className="text-2xl mb-1">{emojiMap[cat.name] || '📁'}</div>
              <div className="text-sm font-medium">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && selectedCategory.children.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Choisissez une sous-catégorie *
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedCategory.children.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubCategoryId(sub.id)}
                className={clsx(
                  'border rounded-3xl px-4 py-3 text-center hover:border-black transition',
                  subCategoryId === sub.id
                    ? 'border-black shadow'
                    : 'border-gray-300'
                )}
              >
                <div className="text-sm font-medium">{sub.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
