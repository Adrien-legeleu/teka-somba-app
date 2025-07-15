'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then(setUsers);
  }, []);

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
