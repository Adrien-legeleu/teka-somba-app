// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Nunito_Sans, Nunito } from 'next/font/google';
import Footer from './components/Footer/Footer';
import RegisterSW from './_components/RegisterSX';

const nunito_sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const nunito = Nunito({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-title',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teka-somba.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Teka Somba – Petites annonces gratuites au Congo',
  description:
    'Déposez et consultez gratuitement des petites annonces au Congo sur Teka Somba : immobilier, véhicules, emploi, services et bien plus encore. Achetez, vendez, louez facilement au Congo.',
  keywords:
    'petites annonces Congo, annonces gratuites Congo, immobilier Congo, voitures Congo, emploi Congo, services Congo, Teka Somba',
  authors: [{ name: 'Teka Somba', url: siteUrl }],

  // PWA
  manifest: '/manifest.webmanifest',
  themeColor: '#ff7a00',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Teka Somba',
  },

  // Icônes
  icons: {
    // favicon/onglet
    icon: [{ url: '/logo-teka-somba.png' }],
    // icône iOS (facultatif mais utile)
    apple: [{ url: '/icons/icon-192.png' }],
  },

  // Partage
  openGraph: {
    title: 'Teka Somba – Petites annonces gratuites au Congo',
    description:
      'Trouvez ou publiez facilement des petites annonces gratuites au Congo : immobilier, véhicules, emploi et services avec Teka Somba.',
    url: siteUrl,
    siteName: 'Teka Somba',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo-teka-somba.png`,
        width: 400,
        height: 400,
        alt: 'Logo Teka Somba',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#ff7a00" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${nunito_sans.variable} ${nunito.variable} antialiased pb-24`}
      >
        <RegisterSW />
        {children}
        <Footer />
      </body>
    </html>
  );
}
