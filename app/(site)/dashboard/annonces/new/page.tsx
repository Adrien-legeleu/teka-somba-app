'use client';
import { useEffect, useState } from 'react';
import NewAdForm from '@/app/components/Form/Ad/NewAdForm';
import Loader from '@/app/components/Fonctionnalities/Loader';

export default function Page() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-14 max-w-7xl w-full  z-10 px-2">
        <div className="w-full bg-white/90 p-10 shadow-2xl shadow-black/10 border rounded-3xl backdrop-blur-xl">
          {categories.length === 0 ? (
            <Loader />
          ) : (
            <NewAdForm categories={categories} />
          )}
        </div>
      </div>
    </div>
  );
}
