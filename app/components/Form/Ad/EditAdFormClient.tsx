'use client';

import { useEffect, useState } from 'react';
import EditAdForm from './EditAdForm';
import { Card } from '@/components/ui/card';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { Ad } from '@/types/ad';
import { Category } from '@/types/category';
import Loader from '../../Fonctionnalities/Loader';

export default function EditAdFormClient({
  userId,
  adId,
}: {
  userId: string;
  adId: string;
}) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const resCategories = await fetch('/api/categories');
      setCategories(await resCategories.json());

      const resAd = await fetch(`/api/ad/user/${userId}/${adId}`);
      if (resAd.ok) {
        setAd(await resAd.json());
      } else {
        window.location.href = '/dashboard/mes-annonces';
      }
    };

    fetchData();
  }, [userId, adId]);

  if (!ad || categories.length === 0) return <Loader />;

  return (
    <div className="p-10 space-y-8">
      {/* Bloc Analytics */}
      <div className="grid grid-cols-3 gap-4 w-full md:w-2/3">
        <Card className="p-4 text-center rounded-2xl shadow-md">
          <Eye className="w-5 h-5 mx-auto text-gray-400 mb-1" />
          <div className="text-lg font-bold">{ad.adAnalytics?.views || 0}</div>
          <div className="text-xs text-gray-500">Vues</div>
        </Card>
        <Card className="p-4 text-center rounded-2xl shadow-md">
          <MessageSquare className="w-5 h-5 mx-auto text-gray-400 mb-1" />
          <div className="text-lg font-bold">
            {ad.adAnalytics?.messagesCount || 0}
          </div>
          <div className="text-xs text-gray-500">Messages</div>
        </Card>
        <Card className="p-4 text-center rounded-2xl shadow-md">
          <Heart className="w-5 h-5 mx-auto text-gray-400 mb-1" />
          <div className="text-lg font-bold">
            {ad.adAnalytics?.favoritesCount || 0}
          </div>
          <div className="text-xs text-gray-500">Favoris</div>
        </Card>
      </div>

      {/* Formulaire d'édition */}
      <EditAdForm ad={ad} categories={categories} userId={userId} />
    </div>
  );
}
