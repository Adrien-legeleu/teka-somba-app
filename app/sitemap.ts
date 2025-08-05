// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teka-somba.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '/',
    '/service-bagage',
    '/mentions-legales',
    '/politique-confidentialite',
    '/conditions-generales',
  ];

  const ads = await prisma.ad.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return [
    ...staticPaths.map(
      (p) =>
        ({
          url: `${BASE_URL}${p}`,
          lastModified: new Date(),
          changeFrequency: p === '/' ? 'daily' : 'weekly',
          priority: p === '/' ? 1 : 0.7,
        }) satisfies MetadataRoute.Sitemap[number]
    ),
    ...ads.map(
      (a) =>
        ({
          url: `${BASE_URL}/annonce/${a.id}`,
          lastModified: a.createdAt,
          changeFrequency: 'daily',
          priority: 0.8,
        }) satisfies MetadataRoute.Sitemap[number]
    ),
  ];
}
