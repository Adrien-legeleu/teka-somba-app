'use client';
import { useEffect, useState } from 'react';
import NewAdForm from '@/app/components/Form/Ad/NewAdForm';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function Page() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <AuroraBackground>
      <div className="p-14 z-10 px-2">
        {categories.length > 0 && <NewAdForm categories={categories} />}
      </div>
    </AuroraBackground>
  );
}
