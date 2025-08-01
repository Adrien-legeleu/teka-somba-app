'use client';

import { IconBriefcase2 } from '@tabler/icons-react';
import CategoryIcon from '../Fonctionnalities/CategoryIcon';
import { useFilter } from './FilterContext';
import Link from 'next/link';

export default function CategoryIconList() {
  const { categories, setCategoryId, setSubCategoryId } = useFilter();
  const topCats = categories.filter((c) => !c.parentId);

  const handleClick = (id: string) => {
    setCategoryId(id);
    setSubCategoryId('');
  };

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2 px-2"
      style={{ scrollbarWidth: 'none' }}
    >
      <Link
        key={'service bagages'}
        href={'/service-bagage'}
        className="flex flex-col items-center cursor-pointer w-16 shrink-0"
      >
        <div className="p-3 bg-orange-200/70 rounded-2xl text-orange-600">
          <span className="text-xl">📦</span>
        </div>
        <span className="text-xs text-center mt-1 font-medium">Bagages</span>
      </Link>
      {topCats.map((cat) => (
        <div
          key={cat.id}
          onClick={() => handleClick(cat.id)}
          className="flex flex-col items-center cursor-pointer w-16 shrink-0"
        >
          <div className="p-3 bg-orange-200/70 rounded-2xl text-orange-800">
            <CategoryIcon name={cat.icon} />
          </div>
          <span className="text-xs text-center mt-1 font-medium">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
