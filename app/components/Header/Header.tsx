'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserCircle, Heart, MessageCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);

  // Récupère dynamiquement les catégories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // Navigation personnalisée
  function handleCategoryClick(catId: string, e: React.MouseEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set('categoryId', catId);
    router.push('/?' + params.toString());
  }

  // ID sélectionné dans l'URL
  const selectedCatId = searchParams.get('categoryId');

  return (
    <header className="w-full bg-white/90 backdrop-blur-xl shadow-md border-b border-gray-100 z-50 sticky top-0">
      {/* BARRE PRINCIPALE */}
      <div className="max-w-7xl mx-auto px-4 flex items-center h-[72px] gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <span className="text-3xl font-black text-orange-500 tracking-tight font-[Poppins,Arial,sans-serif]">
            teka
          </span>
          <span className="text-3xl font-black text-[#FFBF00] font-[Poppins,Arial,sans-serif]">
            somba
          </span>
        </Link>

        {/* Déposer une annonce */}
        <Link href="/dashboard/annonces/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-2 text-lg font-semibold flex items-center gap-2 shadow">
            <Plus size={20} /> Déposer une annonce
          </Button>
        </Link>

        {/* Recherche rapide */}
        <form
          action="/recherche"
          className="flex items-center bg-gray-100 rounded-xl px-4 ml-4 max-w-sm w-full relative"
        >
          <input
            name="q"
            placeholder="Rechercher…"
            className="bg-transparent outline-none border-0 h-10 w-full text-gray-700 font-medium"
            autoComplete="off"
          />
          <button
            type="submit"
            className="ml-2 p-1 bg-orange-500 hover:bg-orange-600 rounded-xl text-white"
          >
            <Search size={20} />
          </button>
        </form>

        <div className="flex-1" />

        {/* Icônes actions */}
        <nav className="flex items-center gap-4">
          <Link href="/dashboard/favoris" className="relative group">
            <Heart
              size={24}
              className="text-gray-600 group-hover:text-orange-500 transition"
            />
          </Link>
          <Link href="/dashboard/messages" className="relative group">
            <MessageCircle
              size={24}
              className="text-gray-600 group-hover:text-orange-500 transition"
            />
          </Link>
          <Link href="/dashboard" className="relative group">
            <UserCircle
              size={24}
              className="text-gray-600 group-hover:text-orange-500 transition"
            />
          </Link>
        </nav>
      </div>

      {/* MENU CATEGORIES (dynamique, dropdown au hover) */}
      <nav className="w-full border-t border-gray-100 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-12 gap-4 overflow-x-auto">
          {categories.map((cat: any) => (
            <div key={cat.id} className="relative group">
              {/* Catégorie principale */}
              <a
                href={`/?categoryId=${cat.id}`}
                onClick={(e) => handleCategoryClick(cat.id, e)}
                className={`px-2 py-1 text-base font-medium whitespace-nowrap transition ${
                  selectedCatId === cat.id
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                {cat.name}
              </a>
              {/* Dropdown sous-catégories au hover */}
              {cat.children && cat.children.length > 0 && (
                <div
                  className="
                  absolute left-0 top-full min-w-[200px]
                  bg-white border shadow-lg rounded-xl py-2 mt-2 opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-all duration-150 z-50
                "
                >
                  {cat.children.map((sub: any) => (
                    <a
                      key={sub.id}
                      href={`/?categoryId=${sub.id}`}
                      onClick={(e) => handleCategoryClick(sub.id, e)}
                      className={`block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition rounded-lg ${
                        selectedCatId === sub.id
                          ? 'text-orange-600 font-bold'
                          : ''
                      }`}
                    >
                      {sub.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
}
