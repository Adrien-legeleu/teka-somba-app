'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

function DashboardHeader({ user }: { user: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="px-10 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl bg-white w-full max-md:max-w-xl max-w-5xl border rounded-3xl p-7 mb-10 shadow-black/10 shadow-2xl relative"
    >
      {user.isAdmin && (
        <Link
          href={'/admin'}
          className="bg-[#ffbf00]/20 px-2 py-0.5 text-sm absolute top-3 right-3 rounded-full text-[#ec5d22] font-semibold"
        >
          Admin★
        </Link>
      )}

      {/* Bloc gauche : Avatar + infos */}
      <div className="flex md:items-center items-center max-md:flex-col gap-5">
        <div className="w-32 h-32 aspect-square rounded-full bg-[#ffbf00] flex items-center justify-center text-4xl font-bold text-white border-2 border-white shadow-xl">
          {user.avatar ? (
            <Image
              width={80}
              height={80}
              src={user.avatar}
              alt="Avatar"
              className="rounded-full w-full h-full object-cover"
            />
          ) : (
            user.prenom?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl">
              {user.prenom} {user.name}
            </span>

            {user.age && (
              <span className="text-gray-500 text-sm">{user.age} ans</span>
            )}
          </div>
          <div className="text-sm text-gray-500">{user.city}</div>

          <div
            className="glowing-box glowing-box-active mt-5"
            style={{ '--animation-speed': '2s' } as React.CSSProperties}
          >
            <div className="glowing-box-animations">
              <div className="glowing-box-glow"></div>
              <div className="glowing-box-stars-masker">
                <div className="glowing-box-stars"></div>
              </div>
            </div>
            <div className="glowing-box-borders-masker">
              <div className="glowing-box-borders"></div>
            </div>

            <Link href="/dashboard/profil">
              <button className="glowing-box-button shadow-xl">
                <span className="glowing-span">Modifier mon profil</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bloc droit : porte-monnaie */}
      <div className="flex flex-col pt-5 md:items-end items-center gap-1">
        <div className="text-gray-600 text-md">Porte-monnaie</div>
        <div className="text-4xl font-bold text-[var(--color-secondary)]">
          {user.credit} crédits
        </div>
        <div className="text-xs text-gray-400">Solde disponible</div>
        <p className="text-xs">Porte-Monnaie bientôt disponible</p>
      </div>
    </motion.div>
  );
}

export default DashboardHeader;
