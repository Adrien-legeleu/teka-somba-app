'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminClientSide() {
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/users').then(async (res) => {
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUsers(data);
    });
  }, [router]);

  async function promoteAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return setMsg('Email requis');
    const res = await fetch('/api/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setMsg(`Promotion de ${email} réussie !`);
      setEmail('');
    } else {
      const data = await res.json();
      setMsg(data.error || 'Erreur lors de la promotion');
    }
  }

  async function handleAction(id: string, action: string) {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, action }),
    });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
      setMsg(action === 'approve' ? 'Validé !' : 'Refusé !');
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Interface Admin</h1>
      <form onSubmit={promoteAdmin} className="mb-6 flex gap-2 items-end">
        <input
          type="email"
          placeholder="Email à promouvoir admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-2 py-1"
        />
        <button
          className="bg-purple-700 text-white px-3 py-1 rounded"
          type="submit"
        >
          Rendre admin
        </button>
      </form>
      {users.length === 0 ? (
        <p>Aucun compte à valider.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id} className="mb-3 flex items-center gap-4">
              <span>
                {u.name} ({u.email})
              </span>
              {u.identityCardUrl && (
                <a
                  href={u.identityCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Carte d'identité
                </a>
              )}
              <button
                onClick={() => handleAction(u.id, 'approve')}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Valider
              </button>
              <button
                onClick={() => handleAction(u.id, 'reject')}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Refuser
              </button>
            </li>
          ))}
        </ul>
      )}
      {msg && <div className="mt-4">{msg}</div>}
    </div>
  );
}
