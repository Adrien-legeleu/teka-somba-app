// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

// 👉 Config du plugin PWA
const withPWAFunc = withPWA({
  dest: 'public', // génère le service worker dans /public
  register: true, // enregistre automatiquement le SW
  skipWaiting: true, // prend la main dès l’update
  disable: process.env.NODE_ENV === 'development', // actif en prod uniquement
});

// 👉 Ta config Next existante + PWA
const nextConfig: NextConfig = {
  images: {
    domains: [
      'eyox4yzk3dyvuloc.public.blob.vercel-storage.com',
      'brzyczbssnohcpflfycr.supabase.co',
    ],
  },
};

export default withPWAFunc(nextConfig);
