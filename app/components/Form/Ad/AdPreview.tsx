'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type DynamicField = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
};

type AdPreviewProps = {
  ad: {
    title?: string;
    description?: string;
    price?: number | null;
    location?: string;
    images?: string[];
    lat?: number | null;
    lng?: number | null;
    categoryId?: string | null;
    dynamicFields?: Record<string, any>;
  };
  dynamicFields?: DynamicField[];
};

export default function AdPreview({ ad, dynamicFields = [] }: AdPreviewProps) {
  const {
    title,
    description,
    price,
    location,
    images = [],
    dynamicFields: values = {},
  } = ad ?? {};

  if (!title)
    return (
      <div className="p-6 bg-white rounded-3xl text-center text-sm text-muted-foreground shadow-sm">
        Aperçu de l’annonce…
      </div>
    );

  return (
    <div className="border bg-white rounded-3xl p-6 shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Aperçu image ${i}`}
              width={56}
              height={56}
              className="w-14 h-14 object-cover rounded-md"
            />
          ))}
        </div>
      )}

      {description && (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {description}
        </div>
      )}

      {typeof price === 'number' && !isNaN(price) && (
        <div className="font-bold text-base text-foreground">
          {price.toLocaleString('fr-FR')} FCFA
        </div>
      )}

      {location && (
        <div className="text-xs text-muted-foreground">{location}</div>
      )}

      {dynamicFields.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {dynamicFields.map((f) => {
            const value = values?.[f.name];
            if (value === undefined || value === '') return null;
            return (
              <li key={f.name}>
                <span className="font-medium capitalize">{f.name}</span> :{' '}
                {String(value)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
