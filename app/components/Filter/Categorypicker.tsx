'use client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Category } from '@/types/category';

export function CategorySection({
  categories,
  categoryId,
  setCategoryId,
  subCategoryId,
  setSubCategoryId,
  isActive,
  close,
}: {
  categories: Category[];
  categoryId: string;
  setCategoryId: (val: string) => void;
  subCategoryId: string;
  setSubCategoryId: (val: string) => void;
  isActive?: boolean;
  close?: () => void;
}) {
  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const subCategories: Category[] = selectedCategory?.children ?? [];

  return (
    <div
      className={`flex flex-col gap-1 transition ${isActive ? 'bg-white rounded-2xl shadow-md p-2' : ''}`}
    >
      <Label htmlFor="category" className="font-semibold text-sm">
        Catégorie
      </Label>

      {/* Sélecteur de catégorie */}
      <Select
        value={categoryId}
        onValueChange={(val) => {
          setCategoryId(val);
          setSubCategoryId('');
          if (close) close();
        }}
        name="category"
      >
        <SelectTrigger className="bg-transparent text-sm border-none shadow-none focus:outline-none p-0">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sélecteur de sous-catégorie */}
      {subCategories.length > 0 && (
        <Select
          value={subCategoryId}
          onValueChange={(val) => {
            setSubCategoryId(val);
            if (close) close();
          }}
        >
          <SelectTrigger className="bg-transparent text-sm border-none shadow-none focus:outline-none p-0">
            <SelectValue placeholder="Sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
