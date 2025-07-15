// app/signup/page.tsx
'use client';
import { useRef, useState } from 'react';

export default function SignupPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Inscription</h1>
      <form
        ref={formRef}
        encType="multipart/form-data"
        className="flex flex-col space-y-2 w-80"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(formRef.current!);
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            body: data,
          });
          if (res.ok) {
            setMsg('Inscription envoyée ! Vérification admin requise.');
          } else {
            const json = await res.json();
            setMsg(json.error || 'Erreur lors de l’inscription.');
          }
        }}
      >
        <input
          name="name"
          placeholder="Nom"
          required
          className="px-2 py-1 border"
        />
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
        <input
          name="phone"
          placeholder="Téléphone"
          required
          className="px-2 py-1 border"
        />
        <input
          name="city"
          placeholder="Ville"
          required
          className="px-2 py-1 border"
        />
        <label>Photo de carte d'identité :</label>
        <input
          name="identityCard"
          type="file"
          accept="image/*"
          required
          className="border"
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white py-1">
          S’inscrire
        </button>
      </form>
      {msg && <div className="mt-4 text-center">{msg}</div>}
    </div>
  );
}
