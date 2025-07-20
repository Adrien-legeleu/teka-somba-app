'use client';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';

function calculateAge(dateString: string): number {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function SignUp() {
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [errorAge, setErrorAge] = useState('');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBirthdate(val);
    if (val && calculateAge(val) < 18) {
      setErrorAge('Inscription interdite aux mineurs (-18 ans)');
    } else {
      setErrorAge('');
    }
  };

  return (
    <AuroraBackground>
      <div className="flex z-10 min-h-screen w-full items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/50 border border-[#ffbf00]/20 rounded-[3rem] shadow-2xl shadow-[#00000010] px-8 py-16 max-w-2xl w-full flex flex-col items-center gap-7"
        >
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-2 text-[var(--color-secondary)] tracking-tight"
          >
            Créer un compte{' '}
            <span className="text-[var(--color-text-primary)]">TEKA-SOMBA</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-base text-[var(--color-secondary)] text-center mb-4"
          >
            Rejoins la communauté d’annonces locale et trouve ce que tu cherches
            !
          </motion.p>

          <form
            ref={formRef}
            encType="multipart/form-data"
            className="flex flex-col gap-4 max-w-md mx-auto w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              if (!birthdate || calculateAge(birthdate) < 18) {
                setErrorAge('Tu dois avoir au moins 18 ans pour t’inscrire.');
                return;
              }
              setLoading(true);
              const data = new FormData(formRef.current!);
              data.set('age', String(calculateAge(birthdate))); // On passe l'âge à l'API, tu ajoutes age côté backend/prisma
              data.set('birthdate', birthdate); // Si tu veux stocker la vraie date

              const res = await fetch('/api/auth/register', {
                method: 'POST',
                body: data,
              });
              setLoading(false);
              if (res.ok) {
                setMsg('Inscription envoyée ! Vérification admin requise.');
                formRef.current?.reset();
                setBirthdate('');
                setTimeout(() => {
                  window.location.href = '/login';
                }, 2000);
                return;
              } else {
                const json = await res.json();
                setMsg(json.error || 'Erreur lors de l’inscription.');
              }
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="prenom"
                placeholder="Prénom"
                required
                disabled={loading}
              />
              <Input
                name="name"
                placeholder="Nom"
                required
                disabled={loading}
              />

              <Input
                name="phone"
                placeholder="Téléphone"
                required
                disabled={loading}
              />
              <Input
                name="city"
                placeholder="Ville"
                required
                disabled={loading}
              />
            </div>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              disabled={loading}
            />
            <Input
              name="password"
              type="password"
              placeholder="Mot de passe"
              required
              disabled={loading}
            />
            <div>
              <label className="text-sm font-semibold text-gray-800">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <Input
                name="birthdate"
                type="date"
                value={birthdate}
                max={new Date().toISOString().split('T')[0]} // impossible future
                onChange={handleDateChange}
                required
                disabled={loading}
                className={errorAge ? 'border-red-500' : ''}
              />
              {errorAge && (
                <div className="text-red-600 text-xs mt-1">{errorAge}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-1">
                Carte d'identité (photo)
              </label>
              <Input
                name="identityCard"
                type="file"
                accept="image/*"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="mt-4"
              disabled={loading || !!errorAge}
            >
              {loading ? 'Inscription...' : 'S’inscrire'}
            </Button>
          </form>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#ec5d22] hover:text-[#ffbf00] underline self-center"
          >
            Déjà inscrit ? Se connecter
          </Link>
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                className="mt-3 text-center text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200 shadow"
              >
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
