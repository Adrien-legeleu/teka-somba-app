// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Nunito_Sans, Nunito } from 'next/font/google';
import Footer from './components/Footer/Footer';

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
  icons: {
    icon: '/logo-teka-somba.png', // pour la favicon onglet navigateur
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${nunito_sans.variable} ${nunito.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
