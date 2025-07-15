'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Réinitialiser le mot de passe</h1>
      <form
        className="flex flex-col space-y-2 w-80"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            setMsg('Mot de passe changé !');
            setTimeout(() => router.push('/login'), 1500);
          } else setMsg((await res.json()).error || 'Erreur');
        }}
      >
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-2 py-1 border"
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white py-1">
          Valider
        </button>
      </form>
      {msg && <div className="mt-4 text-center">{msg}</div>}
    </div>
  );
}
