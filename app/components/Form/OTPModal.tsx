'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function OTPModal({
  email,
  onVerified,
  onClose,
}: {
  email: string;
  onVerified: () => void;
  onClose?: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        toast.success('Compte vérifié !');
        onVerified();
      } else {
        const json = await res.json();
        setError(json.error || 'Code incorrect.');
      }
    } catch {
      setError('Erreur réseau. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    toast('Envoi du code en cours...');
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toast.success('Code renvoyé à ' + email);
    } catch {
      toast.error('Impossible de renvoyer le code');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center"
        >
          {/* Bouton de fermeture */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Vérification de l&apos;email
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Un code de confirmation a été envoyé à <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>

          {/* Input OTP */}
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(val: string) => setOtp(val)}
          >
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <Button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full mt-6 text-lg rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-primary)] transition-all shadow-lg"
          >
            {loading ? 'Vérification...' : 'Valider le code'}
          </Button>

          <button
            onClick={resendCode}
            className="mt-4 text-sm text-[#ec5d22] hover:underline"
          >
            Renvoyer le code
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
