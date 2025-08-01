'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.get('email'),
        password: data.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);

    if (res.redirected) {
      window.location.href = res.url;
    } else {
      let error = 'Erreur de connexion.';
      try {
        const json = await res.json();
        error = json.error || error;
      } catch {}
      setMsg(error);
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-2 text-[var(--color-secondary)] tracking-tight"
          >
            Bienvenue sur{' '}
            <span className="text-[var(--color-text-primary)] block drop-shadow-sm">
              TEKA-SOMBA
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-base text-[var(--color-secondary)] text-center mb-4"
          >
            Connecte-toi pour retrouver tes annonces, messages et favoris.
          </motion.p>

          <motion.form
            className="flex flex-col gap-4 max-w-sm mx-auto w-full"
            initial={false}
            animate={msg ? { scale: 1.04 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 12 }}
            onSubmit={handleSubmit}
          >
            <Input
              name="email"
              type="email"
              placeholder="Adresse email"
              autoComplete="email"
              required
              disabled={loading}
            />
            <Input
              name="password"
              type="password"
              placeholder="Mot de passe"
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="mt-4">
              {loading ? (
                <span className="animate-pulse">Connexion…</span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </motion.form>

          <Link
            href="/forgot-password"
            className="mt-1 text-sm text-[#085e54] hover:text-[#ffbf00] transition-colors underline"
          >
            Mot de passe oublié ?
          </Link>

          <Link
            href="/signup"
            className="text-sm font-semibold text-[#ec5d22] hover:text-[#ffbf00] underline self-center"
          >
            Pas encore inscrit ? Créer un compte
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
