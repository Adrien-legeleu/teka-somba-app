// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://teka-somba.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/dashboard',
        '/login',
        '/signup',
        '/reset-password',
        '/forgot-password',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
