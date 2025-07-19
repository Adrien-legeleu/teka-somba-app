'use client';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { Category } from '@/types/category';

export function CategoryPicker({
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
  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const subCategories: Category[] = selectedCategory?.children ?? [];

  return (
    <div className="flex gap-2">
      <Select
        value={categoryId}
        onValueChange={(val) => {
          setCategoryId(val);
          setSubCategoryId('');
        }}
      >
        <SelectTrigger>
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
      {subCategories.length > 0 && (
        <Select value={subCategoryId} onValueChange={setSubCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map(
              (
                sub: Category // ICI on TYPPE
              ) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
