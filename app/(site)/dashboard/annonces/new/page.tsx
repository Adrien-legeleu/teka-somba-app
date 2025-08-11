'use client';
import { useEffect, useState } from 'react';
import NewAdForm from '@/app/components/Form/Ad/NewAdForm';
import Loader from '@/app/components/Fonctionnalities/Loader';
import type { DynamicField } from '@/types/ad';

// Même shape que celui attendu par NewAdForm
type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};

function redirectToLogin(): void {
  const next = typeof window !== 'undefined' ? window.location.pathname : '/';
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/status', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.status === 401) return false;
    if (!res.ok) return false;
    const data = (await res.json()) as { authenticated?: boolean };
    return !!data.authenticated;
  } catch {
    return false;
  }
}

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;

    const ensureAuthAndLoad = async () => {
      const authed = await checkAuth();
      if (!authed) {
        redirectToLogin();
        return;
      }

      try {
        const res = await fetch('/api/categories', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.status === 401) {
          redirectToLogin();
          return;
        }
        if (!res.ok) {
          console.error('❌ /api/categories failed with status:', res.status);
          if (mounted) setCategories([]);
          return;
        }
        const data = (await res.json()) as Category[];
        if (mounted) setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Fetch crashed:', err);
        if (mounted) setCategories([]);
      }
    };

    // au mount
    ensureAuthAndLoad();

    // re-check quand l’onglet redevient actif / la fenêtre a le focus
    const onFocus = () => void ensureAuthAndLoad();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void ensureAuthAndLoad();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-14 max-w-7xl w-full z-10 px-2">
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
