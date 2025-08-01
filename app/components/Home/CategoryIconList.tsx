'use client';

import CategoryIcon from '../Fonctionnalities/CategoryIcon';
import { useFilter } from './FilterContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CategoryIconList() {
  const { categories, setCategoryId, setSubCategoryId } = useFilter();
  const topCats = categories.filter((c) => !c.parentId);

  const handleClick = (id: string) => {
    setCategoryId(id);
    setSubCategoryId('');
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-l from-white to-transparent absolute z-20 right-0 h-full top-0 w-5" />
      <div className="bg-gradient-to-r from-white to-transparent absolute z-20 left-0 h-full top-0 w-5" />
      <div
        className="flex relative gap-4 overflow-x-auto pb-2 px-2"
        style={{ scrollbarWidth: 'none' }}
      >
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
            key={'service bagages'}
            href={'/service-bagage'}
            className="flex flex-col items-center cursor-pointer w-16 shrink-0"
          >
            <div className="p-3 bg-orange-200/70 !aspect-square flex shadow-lg shadow-black/7 items-center justify-center rounded-3xl text-orange-600">
              <span className="text-2xl">📦</span>
            </div>
            <span className="text-xs text-center mt-1 font-medium">
              Bagages
            </span>
          </Link>
        </motion.div>

        {topCats.map((cat) => (
          <motion.div
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{
              type: 'spring',
              damping: 8,
              stiffness: 130,
              mass: 0.7,
            }}
            className="flex flex-col items-center cursor-pointer w-16 shrink-0"
          >
            <div className="p-3 bg-orange-200/70 shadow-lg shadow-black/7 !aspect-square flex items-center justify-center rounded-3xl text-orange-800">
              <CategoryIcon name={cat.icon} />
            </div>
            <span className="text-xs text-center mt-1 font-medium">
              {cat.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
