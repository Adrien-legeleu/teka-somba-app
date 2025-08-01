'use client';

import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import SellerMap from './SellerMap';

type Seller = {
  id: string;
  name: string;
  prenom?: string | null;
  avatar?: string | null;
  phone?: string | null;
  city?: string | null;
  age?: number | null;
  email: string | null;
  isVerified?: boolean;
};

type SellerProfileProps = {
  user?: Seller;
  ad: {
    location?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('242')) {
    return digits.replace(/^242(\d{2})(\d{3})(\d{4})$/, '+242 $1 $2 $3');
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1 $2 $3 $4 $5'
    );
  }
  return phone;
}

export default function SellerProfile({ user, ad }: SellerProfileProps) {
  if (!user) {
    return (
      <div className="mt-10 p-8 bg-white rounded-3xl shadow-2xl border text-center">
        <p className="text-gray-500 text-lg">Vendeur inconnu.</p>
      </div>
    );
  }

  const fullName = `${user.prenom ?? ''} ${user.name ?? ''}`.trim();

  return (
    <div className="mt-10 p-6 bg-white rounded-3xl shadow-2xl border space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.avatar && (
            <Image
              src={user.avatar}
              alt="avatar"
              width={70}
              height={70}
              className="object-cover rounded-3xl shadow-md aspect-square"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              {fullName || 'Utilisateur'}
              {user.isVerified && (
                <Badge
                  className="text-xs px-2 py-1 rounded-full text-white"
                  style={{
                    background: 'linear-gradient(90deg, #00c06c, #007a50)',
                  }}
                >
                  Vérifié
                </Badge>
              )}
            </h2>
            {user.city && <p className="text-sm text-gray-500">{user.city}</p>}
          </div>
        </div>
      </div>

      {/* Infos vendeur */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {user.age && (
          <div className="bg-neutral-50 rounded-3xl p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-400 mb-1">Âge</div>
            <div className="font-medium text-gray-800">{user.age} ans</div>
          </div>
        )}
        {user.phone && user.email && (
          <div className="bg-neutral-50 rounded-3xl p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-400 mb-1">
              Téléphone
            </div>
            <div className="font-medium text-sm text-gray-800">
              {formatPhone(user.phone)}
            </div>
            <div className="text-xs uppercase text-gray-400 mb-1">Email</div>
            <div className="font-medium text-sm text-gray-800">
              {user.email}
            </div>
          </div>
        )}
        {user.city && (
          <div className="bg-neutral-50 rounded-3xl p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-400 mb-1">Ville</div>
            <div className="font-medium text-gray-800">{user.city}</div>
          </div>
        )}
      </div>

      {/* Localisation de l'annonce */}
      {ad.location && (
        <div className="bg-neutral-50 rounded-3xl p-4 shadow-sm">
          <div className="text-xs uppercase text-gray-400 mb-1">
            Localisation de l&apos;annonce
          </div>
          <div className="font-medium text-gray-800">{ad.location}</div>
          <p className="text-xs text-gray-500 mt-1">
            La localisation exacte sera communiquée par le vendeur.
          </p>
        </div>
      )}

      {/* Carte */}
      {ad.lat && ad.lng ? (
        <div className="rounded-3xl overflow-hidden border shadow-sm">
          <SellerMap lat={ad.lat} lng={ad.lng} radius={300} />
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">
          Localisation non disponible.
        </div>
      )}
    </div>
  );
}
