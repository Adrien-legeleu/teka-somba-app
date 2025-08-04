'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/category';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoryModalMobile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');

        if (!res.ok) {
          console.error('❌ /api/categories failed:', res.status);
          setCategories([]);
          return;
        }

        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('❌ Fetch failed:', err);
        setCategories([]);
      }
    }

    fetchCategories();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/30 z-40" aria-hidden="true" />
      <div className="fixed inset-0 z-50 p-4 bg-white overflow-y-auto rounded-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Toutes les catégories</h2>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              href={`/?categoryId=${cat.id}`}
              key={cat.id}
              onClick={onClose}
              className="p-4 bg-orange-50 rounded-xl text-center font-medium text-sm hover:bg-orange-100 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
