'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandTiktok,
} from '@tabler/icons-react';
import MobileNavLink from '../Home/MobileNavLink';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-gray-200 ">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo et description */}
        <div>
          <Link href="/">
            <Image
              src="/logo teka somba.png"
              alt="Teka Somba"
              width={150}
              height={50}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            Teka Somba, votre plateforme d’annonces en ligne pour acheter,
            vendre ou donner facilement vos produits et services.
          </p>
        </div>

        {/* Liens rapides */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <MobileNavLink
                href="/"
                className="hover:text-orange-600 transition"
              >
                Accueil
              </MobileNavLink>
            </li>
            <li>
              <Link
                href="/dashboard/annonces/new"
                className="hover:text-orange-600 transition"
              >
                Déposer une annonce
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/favoris"
                className="hover:text-orange-600 transition"
              >
                Favoris
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/wallet"
                className="hover:text-orange-600 transition"
              >
                Porte-Monnaie
              </Link>
            </li>
          </ul>
        </div>

        {/* Informations légales */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Informations
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/mentions-legales"
                className="hover:text-orange-600 transition"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                href="/politique-confidentialite"
                className="hover:text-orange-600 transition"
              >
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link
                href="/conditions-generales"
                className="hover:text-orange-600 transition"
              >
                Conditions générales
              </Link>
            </li>
          </ul>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Suivez-nous
          </h3>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/teka_sombaofficiel?igsh=bTZ3NDh3b2J6bzRt&utm_source=qr"
              target="_blank"
              className="p-2 bg-white rounded-full shadow hover:bg-orange-500 hover:text-white transition"
            >
              <IconBrandInstagram size={20} />
            </a>

            <a
              href="https://www.tiktok.com/@teka_somba.offici?_t=ZN-8yWCzmJ8Auk&_r=1"
              target="_blank"
              className="p-2 bg-white rounded-full shadow hover:bg-orange-500 hover:text-white transition"
            >
              <IconBrandTiktok size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bas de page */}
      <div className="border-t border-gray-200 py-4">
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Teka Somba. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
