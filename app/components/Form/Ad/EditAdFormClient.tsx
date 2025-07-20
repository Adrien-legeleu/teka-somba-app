'use client';

import { useEffect, useState } from 'react';
import EditAdForm from './EditAdForm';

export default function EditAdFormClient({
  userId,
  adId,
}: {
  userId: string;
  adId: string;
}) {
  const [ad, setAd] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const resCategories = await fetch('/api/categories');
      const categoriesData = await resCategories.json();
      setCategories(categoriesData);

      const resAd = await fetch(`/api/ad/user/${userId}/${adId}`);
      if (resAd.ok) {
        const adData = await resAd.json();
        setAd(adData);
      } else {
        window.location.href = '/dashboard/mes-annonces';
      }
    };

    fetchData();
  }, [userId, adId]);

  if (!ad || categories.length === 0) return <p>Chargement...</p>;

  return (
    <div className="p-20">
      <EditAdForm ad={ad} categories={categories} userId={userId} />
    </div>
  );
}
