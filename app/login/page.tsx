'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Connexion</h1>
      <form
        className="flex flex-col space-y-2 w-80"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.target as HTMLFormElement);
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: data.get('email'),
              password: data.get('password'),
            }),
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) router.push('/dashboard');
          else setMsg((await res.json()).error || 'Erreur');
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="px-2 py-1 border"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="px-2 py-1 border"
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white py-1">
          Se connecter
        </button>
      </form>
      <a href="/forgot-password" className="mt-2 text-sm text-blue-600">
        Mot de passe oublié ?
      </a>
      {msg && <div className="mt-4 text-center text-red-600">{msg}</div>}
    </div>
  );
}
