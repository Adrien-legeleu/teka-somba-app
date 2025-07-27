'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Gift, Luggage } from 'lucide-react';
import DashboardNav from './DashboardNav';
import Image from 'next/image';
import { IconSearch } from '@tabler/icons-react';

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
  const [expanded, setExpanded] = useState(false);
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
      <div className="max-w-7xl mx-auto relative px-4 flex justify-between items-center h-20 gap-10">
        {/* Logo */}
        <Link href="/">
          <Image
            src={'/logo teka somba.png'}
            alt="logo teka somba"
            width={200}
            height={200}
            className="w-full object-contain h-16 "
          />
        </Link>
        <Link
          href="/dashboard/annonces/new"
          style={{
            background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
          }}
          className="css-btn relative flex items-center text-white font-medium text-[17px] rounded-3xl px-[1.2em] pr-[3.3em] py-[0.35em] h-[2.8em] overflow-hidden cursor-pointer shadow-inner shadow-orange-700 transition-all duration-300 group"
        >
          Déposer une annonce
          <span className="absolute right-[0.3em] p-2 group-hover:p-0 flex items-center justify-center bg-white rounded-3xl h-[2.2em] w-[2.2em] ml-[1em] shadow-md shadow-orange-700 transition-all duration-300 group-hover:w-[calc(100%-0.6em)]">
            <Plus className="w-full h-full text-orange-600 transition-transform duration-300 group-hover:translate-x-[0.1em]" />
          </span>
        </Link>

        <form
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden h-16 max-w-md p-2 w-full"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="flex-grow px-4 text-gray-700 placeholder-gray-400 bg-transparent outline-none h-full"
          />

          <motion.button
            type="submit"
            initial={false}
            animate={{ width: expanded ? '140px' : '64px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex items-center justify-center text-white font-medium h-full"
            style={{
              background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
              borderRadius: '9999px',
            }}
          >
            <IconSearch size={22} className="text-white" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 text-sm font-semibold whitespace-nowrap"
                >
                  Rechercher
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>
        <div className="flex-1" />
        <DashboardNav />
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
