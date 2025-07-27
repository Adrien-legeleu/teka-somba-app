'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle,
  Heart,
  MessageCircle,
  Plus,
  Gift,
  Luggage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Category = {
  id: string;
  name: string;
  children?: Category[];
};

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({
    left: 0,
    top: 0,
    width: 200,
  });
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedCatId = searchParams.get('categoryId');
  const isDonActive = searchParams.get('isDon') === 'true';

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data));
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  function handleCategoryClick(catId: string, e: React.MouseEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('categoryId', catId);
    router.push('/?' + params.toString());
  }

  function handleDonClick(e: React.MouseEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (isDonActive) params.delete('isDon');
    else params.set('isDon', 'true');
    router.push('/?' + params.toString());
  }

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (search.trim()) params.set('q', search);
    else params.delete('q');
    router.push('?' + params.toString());
  }

  function showDropdown(catId: string) {
    setActiveCat(catId);
    const rect = catRefs.current[catId]?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        width: rect.width,
      });
    }
  }

  function closeDropdown() {
    setActiveCat(null);
  }

  return (
    <header className="w-full bg-neutral-50 border-b border-gray-100 z-[1000] sticky top-0">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-20 gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <span className="text-3xl font-black text-orange-500 tracking-tight">
            teka
          </span>
          <span className="text-3xl font-black text-[#FFBF00]">somba</span>
        </Link>

        {/* Déposer une annonce */}
        <Link href="/dashboard/annonces/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-2 text-lg font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition">
            <Plus size={22} /> Déposer une annonce
          </Button>
        </Link>

        {/* Barre de recherche */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center justify-between border h-16 border-gray-200 p-2 rounded-full ml-4 max-w-md w-full shadow-sm transition relative"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="bg-transparent outline-none border-0 h-full w-full text-gray-700 text-sm font-medium px-2"
          />
          <button
            type="submit"
            className="text-lg bg-orange-500 min-w-16 h-full hover:bg-orange-600 rounded-full text-white transition"
          >
            🔍
          </button>
        </form>

        <div className="flex-1" />

        {/* Icônes */}
        <nav className="flex items-center gap-5">
          <Link href="/dashboard/favoris">
            <Heart
              size={28}
              className="text-gray-600 hover:text-orange-500 transition-transform hover:scale-110"
            />
          </Link>
          <Link href="/dashboard/messages">
            <MessageCircle
              size={28}
              className="text-gray-600 hover:text-orange-500 transition-transform hover:scale-110"
            />
          </Link>
          <Link href="/dashboard">
            <UserCircle
              size={28}
              className="text-gray-600 hover:text-orange-500 transition-transform hover:scale-110"
            />
          </Link>
        </nav>
      </div>

      {/* MENU CATEGORIES */}
      <nav className="w-full z-50 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-12 gap-4 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <div
              key={cat.id}
              ref={(el) => {
                catRefs.current[cat.id] = el;
              }}
              className="relative group"
              onMouseEnter={() => showDropdown(cat.id)}
              onMouseLeave={closeDropdown}
            >
              <Link
                href={`/?categoryId=${cat.id}`}
                onClick={(e) => handleCategoryClick(cat.id, e)}
                className={`px-2 py-1 text-sm font-medium whitespace-nowrap transition ${
                  selectedCatId === cat.id
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                {cat.name}
              </Link>
            </div>
          ))}
        </div>

        {/* SOUS-CATEGORIES (Portal) */}
        {activeCat &&
          categories.find((c) => c.id === activeCat)?.children?.length &&
          createPortal(
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute bg-white border max-h-96 overflow-scroll shadow-lg rounded-3xl py-2 z-[9999]"
                style={{
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  minWidth: dropdownPos.width,
                }}
                onMouseEnter={() => setActiveCat(activeCat)}
                onMouseLeave={closeDropdown}
              >
                {categories
                  .find((c) => c.id === activeCat)
                  ?.children?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/?categoryId=${sub.id}`}
                      onClick={(e) => handleCategoryClick(sub.id, e)}
                      className={`block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition rounded-3xl ${
                        selectedCatId === sub.id
                          ? 'text-orange-600 font-bold'
                          : ''
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
      </nav>

      {/* LIENS SUPPLÉMENTAIRES */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-12">
        <Link
          href="/?isDon=true"
          onClick={handleDonClick}
          className={`flex items-center gap-2 px-4 py-1 rounded-full transition ${
            isDonActive
              ? 'bg-orange-100 text-orange-600 font-semibold'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          <Gift size={18} /> Dons
        </Link>

        <Link
          href="/services-bagages"
          className={`flex items-center gap-2 px-4 py-1 rounded-full transition ${
            pathname?.includes('services-bagages')
              ? 'bg-orange-100 text-orange-600 font-semibold'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          <Luggage size={18} /> Services bagages
        </Link>
      </div>
    </header>
  );
}
