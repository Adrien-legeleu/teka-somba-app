'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPasswordContent() {
  const [msg, setMsg] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  // Vérifie à l'affichage : pas de token -> redirige /login
  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  // (Facultatif : tu peux afficher un message "Lien invalide ou expiré" à la place)
  if (!token) return null;

  return (
    <AuroraBackground>
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="backdrop-blur-xl bg-white/90 border border-[#ffbf00]/20 rounded-[3rem] shadow-2xl shadow-[#00000010] px-8 py-16 max-w-2xl w-full flex flex-col items-center gap-7"
        >
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="text-4xl sm:text-5xl font-extrabold text-center mb-2 text-[var(--color-secondary)]"
          >
            Réinitialiser le mot de passe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="text-base text-[var(--color-secondary)] text-center mb-4"
          >
            Crée un nouveau mot de passe sécurisé.
          </motion.p>
          <form
            className="flex flex-col gap-4 max-w-sm mx-auto w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password }),
                headers: { 'Content-Type': 'application/json' },
              });
              setLoading(false);
              if (res.ok) {
                setMsg('Mot de passe changé !');
                setTimeout(() => router.push('/login'), 1500);
              } else setMsg((await res.json()).error || 'Erreur');
            }}
          >
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              style={{
                background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
              }}
              disabled={loading}
              className="text-white"
            >
              {loading ? 'Validation...' : 'Valider'}
            </Button>
          </form>
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                className="mt-3 text-center text-[#085e54] text-sm bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 shadow"
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
