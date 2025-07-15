'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Mot de passe oublié</h1>
      <form
        className="flex flex-col space-y-2 w-80"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.target as HTMLFormElement);
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email: data.get('email') }),
            headers: { 'Content-Type': 'application/json' },
          });
          setMsg('Si cet email existe, un lien a été envoyé.');
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="Votre email"
          required
          className="px-2 py-1 border"
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white py-1">
          Envoyer le lien
        </button>
      </form>
      {msg && <div className="mt-4 text-center">{msg}</div>}
    </div>
  );
}
