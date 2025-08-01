'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import {
  IconSearch,
  IconPlus,
  IconHome,
  IconHeart,
  IconMessage,
  IconUser,
} from '@tabler/icons-react';
import DashboardNav from './DashboardNav';
import CategoryIcon from '../Fonctionnalities/CategoryIcon';
import socket from '@/lib/socket';
import { toast } from 'sonner';

type Category = {
  id: string;
  name: string;
  icon: string;
  children?: Category[];
};

export default function Header() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [expanded, setExpanded] = useState(false);
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

  const gradient = 'linear-gradient(90deg, #ff7a00, #ff3c00)';

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search);
    router.push('/?' + params.toString());
  }

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
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    socket.on('new_message', (message) => {
      setHasUnread(true);
      toast('💬 Nouveau message reçu : ' + message.content);
    });
    fetch('/api/messages/unread')
      .then((res) => res.json())
      .then((data) => {
        setHasUnread(data.unread);
      })
      .catch(() => {});

    return () => {
      socket.off('new_message');
    };
  }, []);

  return (
    <header className="w-full bg-[#F9F9F9] max-md:rounded-b-3xl max-md:shadow-xl max-md:shadow-black/5 border-b border-gray-100 z-[1000] sticky top-0">
      <div className="w-full max-w-7xl hidden md:flex mx-auto relative px-4 justify-between items-center h-20 gap-4">
        <Link href="/">
          <Image
            src={'/logo teka somba.png'}
            alt="logo teka somba"
            width={200}
            height={200}
            className="h-14 w-auto object-contain"
          />
        </Link>

        <form
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onSubmit={handleSearchSubmit}
          className="hidden md:flex relative items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden h-14 max-w-md p-2 w-fit"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="flex-grow px-4 text-gray-700 placeholder-gray-400 bg-transparent xl:text-md text-sm outline-none h-full"
          />
          <motion.button
            type="submit"
            initial={false}
            animate={{ width: expanded ? '140px' : '64px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex items-center justify-center text-white font-medium h-full"
            style={{ background: gradient, borderRadius: '9999px' }}
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

        <Link
          href="/dashboard/annonces/new"
          style={{ background: gradient }}
          className="hidden md:flex relative items-center text-white font-medium xl:text-md lg:text-sm text-xs rounded-3xl px-[1.2em] pr-[3.3em] py-[0.35em] h-[2.8em] overflow-hidden cursor-pointer shadow-inner shadow-orange-700 transition-all duration-300 group"
        >
          Nouveau
          <span className="absolute right-[0.3em] lg:p-2 p-1 group-hover:p-0 flex items-center justify-center bg-white rounded-3xl h-[2.2em] w-[2.2em] ml-[1em] shadow-md shadow-orange-700 transition-all duration-300 group-hover:w-[calc(100%-0.6em)]">
            <IconPlus className="w-full h-full text-orange-600 transition-transform duration-300 group-hover:translate-x-[0.1em]" />
          </span>
        </Link>

        <div className="hidden md:flex flex-1 justify-end">
          <DashboardNav hasUnread={hasUnread} />
        </div>
      </div>

      <nav className="w-full z-50 relative border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-12 gap-4 overflow-x-auto no-scrollbar">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{
              type: 'spring',
              damping: 8,
              stiffness: 130,
              mass: 0.7,
            }}
          >
            <Link
              href={`/service-bagage`}
              className={`px-2 py-1 text-sm font-medium whitespace-nowrap transition flex items-center gap-2 
        text-gray-700 hover:text-orange-500
    }`}
            >
              <span className="text-xl">📦</span>
              Services bagages
            </Link>
          </motion.div>

          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              ref={(el) => {
                catRefs.current[cat.id] = el;
              }}
              onMouseEnter={() => showDropdown(cat.id)}
              onMouseLeave={closeDropdown}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{
                type: 'spring',
                damping: 8,
                stiffness: 130,
                mass: 0.7,
              }}
              className="relative group"
            >
              <Link
                href={`/?categoryId=${cat.id}`}
                onClick={(e) => handleCategoryClick(cat.id, e)}
                className={`px-2 py-1 text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  selectedCatId === cat.id
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                <CategoryIcon name={cat.icon} />
                {cat.name}
              </Link>
            </motion.div>
          ))}
        </div>

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

      <div className="fixed xs:bottom-1 bottom-0 pb-1 xs:left-1/2 left-0 xs:-translate-x-1/2 sm:w-1/2 xs:w-2/3 w-full xs:rounded-full rounded-t-3xl bg-white border-t border-gray-200 flex items-center justify-around md:hidden h-16 shadow-lg z-[999]">
        <Link
          href="/"
          className="flex flex-col items-center text-gray-600 hover:text-orange-500"
        >
          <IconHome size={28} />
        </Link>
        <Link
          href="/dashboard/favoris"
          className="flex flex-col items-center text-gray-600 hover:text-orange-500"
        >
          <IconHeart size={28} />
        </Link>
        <Link
          href="/dashboard/annonces/new"
          style={{ background: gradient }}
          className="w-14 h-14 -mt-6 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <IconPlus size={26} />
        </Link>

        <Link
          href="/dashboard/messages"
          className="relative flex flex-col items-center text-gray-600 hover:text-orange-500"
        >
          <IconMessage
            size={28}
            className={hasUnread ? 'animate-bounce text-orange-500' : ''}
          />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Link>

        <Link
          href="/dashboard"
          className="flex flex-col items-center text-gray-600 hover:text-orange-500"
        >
          <IconUser size={28} />
        </Link>
      </div>
    </header>
  );
}
