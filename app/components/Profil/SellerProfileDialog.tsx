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
  isVerified?: boolean;
};

type SellerProfileProps = {
  user?: Seller; // user peut être undefined
  ad: {
    location?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
};

export default function SellerProfile({ user, ad }: SellerProfileProps) {
  if (!user) {
    return (
      <div className="mt-10 p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border text-center">
        <p className="text-gray-500 text-lg">Vendeur inconnu.</p>
      </div>
    );
  }

  const fullName = `${user.prenom ?? ''} ${user.name ?? ''}`.trim();

  return (
    <div className="mt-10 p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border space-y-6">
      {/* En-tête vendeur */}
      <div className="flex items-center gap-4">
        {user.avatar && (
          <Image
            src={user.avatar}
            alt="avatar"
            width={60}
            height={60}
            className="rounded-full object-cover shadow"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {fullName || 'Utilisateur'}
            {user.isVerified && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full">
                Vérifié
              </Badge>
            )}
          </h2>
          {user.city && (
            <p className="text-gray-500 text-sm mt-1">{user.city}</p>
          )}
        </div>
      </div>

      {/* Infos complémentaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {typeof user.age === 'number' && (
          <div className="bg-neutral-50 rounded-2xl p-3">
            <div className="text-xs uppercase text-gray-400">Âge</div>
            <div className="font-medium">{user.age} ans</div>
          </div>
        )}
        {user.phone && (
          <div className="bg-neutral-50 rounded-2xl p-3">
            <div className="text-xs uppercase text-gray-400">Téléphone</div>
            <div className="font-medium">{user.phone}</div>
          </div>
        )}
        {ad.location && (
          <div className="bg-neutral-50 rounded-2xl p-3 sm:col-span-2">
            <div className="text-xs uppercase text-gray-400">Localisation</div>
            <div className="font-medium">{ad.location}</div>
          </div>
        )}
      </div>

      {/* Carte */}
      {ad.lat && ad.lng ? (
        <div className="rounded-2xl overflow-hidden border shadow-sm">
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
