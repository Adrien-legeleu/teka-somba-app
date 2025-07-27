'use client';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserCheck2, X, Check, Shield } from 'lucide-react';
import AdminModerateAds from './AdminModerateAds';
import { User } from '@prisma/client';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');

  return (
    <div>
      <header className="mb-8 flex items-center gap-6">
        <Shield className="text-orange-500 w-8 h-8" />
        <h1 className="text-3xl font-bold">Espace d’administration</h1>
      </header>
      <Tabs defaultValue="users" value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">Validation utilisateurs</TabsTrigger>
          <TabsTrigger value="ads">Modération annonces</TabsTrigger>
          <TabsTrigger value="admin">Promouvoir admin</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserModeration />
        </TabsContent>
        <TabsContent value="ads">
          <AdminModerateAds />
        </TabsContent>

        <TabsContent value="admin">
          <AdminPromotion />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserModeration() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, action: string) {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, action }),
    });
    if (res.ok) {
      setUsers((u) => u.filter((usr) => usr.id !== id));
      toast.success(
        action === 'approve'
          ? 'Utilisateur validé !'
          : 'Utilisateur refusé et supprimé.'
      );
    }
  }

  if (loading) return <div>Chargement…</div>;
  if (!users.length) return <div>Aucun utilisateur à valider.</div>;

  return (
    <div className="grid gap-6">
      {users.map((u) => (
        <Card
          key={u.id}
          className="flex flex-col md:flex-row items-center md:justify-between p-6"
        >
          <div className="flex items-center gap-4 flex-1">
            <UserCheck2 className="w-6 h-6 text-orange-500" />
            <div>
              <div className="font-semibold">
                {u.name} <span className="text-gray-500">({u.email})</span>
              </div>
              <div className="text-xs text-gray-400">{u.city}</div>
            </div>
            {u.identityCardUrl && (
              <a
                href={u.identityCardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 text-blue-600 underline"
              >
                Carte d&apos;identité
              </a>
            )}
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => handleAction(u.id, 'approve')}
            >
              <Check className="w-4 h-4 mr-1" /> Valider
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction(u.id, 'reject')}
            >
              <X className="w-4 h-4 mr-1" /> Refuser
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ----------- PROMOUVOIR ADMIN -------------
function AdminPromotion() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function promoteAdmin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
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

  return (
    <Card className="max-w-lg mx-auto p-8">
      <CardContent>
        <form onSubmit={promoteAdmin} className="flex flex-col gap-4">
          <div className="font-semibold text-lg">
            Promouvoir un compte admin
          </div>
          <input
            type="email"
            placeholder="Email à promouvoir"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded-xl"
            required
          />
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
          >
            <Shield className="w-4 h-4 mr-1" /> Promouvoir
          </Button>
          {msg && <div className="text-sm mt-2">{msg}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
