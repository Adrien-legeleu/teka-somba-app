import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';

export function FavoriteButton({
  adId,
  userId,
  isFavoriteInitial,
}: {
  adId: string;
  userId?: string | null; // Peut être undefined si pas connecté
  isFavoriteInitial: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleFavorite = async () => {
    if (!userId) {
      // Redirige vers login si pas connecté
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/favorite', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, userId }),
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur favoris');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={loading}
      variant={isFavorite ? 'destructive' : 'default'}
      className="flex items-center gap-2"
    >
      {isFavorite ? <HeartOff /> : <Heart />}
      {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    </Button>
  );
}
