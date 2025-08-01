'use client';

import * as Icons from '@tabler/icons-react';
import { FC } from 'react';

type IconProps = {
  size?: number;
  className?: string;
};

export default function CategoryIcon({ name }: { name: string }) {
  const IconsMap = Icons as unknown as Record<string, FC<IconProps>>;
  const IconComponent = IconsMap[name];

  if (!IconComponent) {
    return null; // ou <DefaultIcon />
  }

  return <IconComponent size={18} className="text-orange-600 shrink-0" />;
}
