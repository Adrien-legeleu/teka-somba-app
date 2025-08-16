// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

// 👉 Config PWA + runtime caching (Workbox)
const withPWAFunc = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProd, // actif en prod uniquement
  runtimeCaching: [
    // 1) API liste d'annonces - rafraîchie souvent (SWR 60s)
    {
      urlPattern: /^\/api\/ad(\/.*)?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-ads',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // 2) Images distantes (Supabase / Vercel Blob) - SWR 7 jours
    {
      urlPattern:
        /^https:\/\/(eyox4yzk3dyvuloc\.public\.blob\.vercel-storage\.com|brzyczbssnohcpflfycr\.supabase\.co)\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'remote-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // 3) Google Fonts (fichiers de police) - CacheFirst long
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // 4) Google Fonts (CSS) - SWR
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
  ],
});

// 👉 Config Next
const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Si tu build une image Docker/Node : utile pour un bundle plus compact
  output: 'standalone',

  images: {
    domains: [
      'eyox4yzk3dyvuloc.public.blob.vercel-storage.com',
      'brzyczbssnohcpflfycr.supabase.co',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 an pour les images optimisées
  },

  // Réduit le JS chargé pour certaines libs volumineuses
  experimental: {
    optimizePackageImports: [
      '@tabler/icons-react',
      'lucide-react',
      'framer-motion',
    ],
  },

  // (Optionnel) en cas d’erreurs ESLint bloquantes en CI :
  // eslint: { ignoreDuringBuilds: true },
};

export default withPWAFunc(nextConfig);
