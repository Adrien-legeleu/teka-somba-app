'use client';

import { DynamicField, DynamicFieldValues } from '@/types/ad';
import Image from 'next/image';

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
    dynamicFields?: DynamicFieldValues;
    type?: 'FOR_SALE' | 'FOR_RENT';
    durationValue?: number;
    durationUnit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  };
  dynamicFields?: DynamicField[];
};

const getFrenchDurationUnit = (unit: string) => {
  switch (unit) {
    case 'DAY':
      return 'jour';
    case 'WEEK':
      return 'semaine';
    case 'MONTH':
      return 'mois';
    case 'YEAR':
      return 'an';
    default:
      return unit?.toLowerCase?.() ?? '';
  }
};

export default function AdPreview({ ad, dynamicFields = [] }: AdPreviewProps) {
  const {
    title,
    description,
    price,
    location,
    images = [],
    type,
    durationUnit,
    durationValue,
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

      {/* Type de l'annonce */}
      {type && (
        <div className="inline-block px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600">
          {type === 'FOR_SALE' ? 'À vendre' : 'À louer'}
        </div>
      )}

      {/* Durée si location */}
      {type === 'FOR_RENT' && durationValue && durationUnit && (
        <div className="text-xs text-muted-foreground italic">
          Durée de location : {durationValue}{' '}
          {getFrenchDurationUnit(durationUnit)}
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Image ${i + 1}`}
              width={56}
              height={56}
              className="w-14 h-14 object-cover rounded-md"
            />
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {description}
        </p>
      )}

      {/* Prix */}
      {typeof price === 'number' && !isNaN(price) && (
        <div className="font-bold text-base text-foreground">
          {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
        </div>
      )}

      {/* Localisation */}
      {location && (
        <div className="text-xs text-muted-foreground">{location}</div>
      )}

      {/* Champs dynamiques */}
      {dynamicFields.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {dynamicFields.map((f) => {
            const value = values?.[f.name];
            if (value === undefined || value === '') return null;
            return (
              <li key={f.id}>
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
