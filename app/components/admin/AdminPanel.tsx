'use client';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  UserCheck2,
  X,
  Check,
  Shield,
  Package,
  Flag,
  Trash2,
} from 'lucide-react';
import { User, BaggageRequest, Report } from '@prisma/client';
import Link from 'next/link';
function formatPhoneNumber(phone: string): string {
  // Supprimer tout sauf les chiffres
  const cleaned = phone.replace(/\D/g, '');

  // Si le numéro commence par 242 (Congo), le formater comme +242 XX XXX XXXX
  if (cleaned.startsWith('242')) {
    return cleaned.replace(/^242(\d{2})(\d{3})(\d{4})$/, '+242 $1 $2 $3');
  }

  // Si le numéro commence par 0 (France), le formater comme 06 12 34 56 78
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1 $2 $3 $4 $5'
    );
  }

  // Sinon, retour brut (à améliorer si besoin)
  return phone;
}

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  return (
    <div className="bg-gray-50 min-h-[80vh]  py-10">
      <div>
        <header className="mb-8 flex px-5 mx-auto justify-center items-center gap-6">
          <Shield className="text-orange-500 w-8 h-8" />
          <h1 className="md:text-3xl sm:text-2xl max-sm:text-center text-xl font-bold">
            Espace d’administration
          </h1>
        </header>
        <Tabs
          defaultValue="users"
          value={tab}
          onValueChange={setTab}
          className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-4 md:p-5"
        >
          <div className="overflow-x-auto ">
            <TabsList
              className="
                flex w-max
                min-w-full
                
                
                rounded-3xl
                bg-gray-100
                py-8
                px-2
                shadow-inner
                border
                border-gray-200
              "
              style={{ scrollbarWidth: 'none' }}
            >
              <TabsTrigger
                className=" p-6  rounded-3xl text-sm sm:text-base"
                value="users"
              >
                Validation utilisateurs
              </TabsTrigger>

              <TabsTrigger
                className=" p-6 rounded-3xl text-sm sm:text-base"
                value="baggage"
              >
                Service bagages
              </TabsTrigger>
              <TabsTrigger
                className=" p-6 rounded-3xl text-sm sm:text-base"
                value="reports"
              >
                Signalements
              </TabsTrigger>
              <TabsTrigger
                className="p-6 rounded-3xl text-sm sm:text-base"
                value="support"
              >
                Support
              </TabsTrigger>
              <TabsTrigger
                className=" p-6 rounded-3xl text-sm sm:text-base"
                value="admin"
              >
                Promouvoir admin
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="py-6">
            <TabsContent value="users">
              <UserModeration />
            </TabsContent>
            <TabsContent value="baggage">
              <BaggageRequests />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsList />
            </TabsContent>

            <TabsContent value="support">
              <SupportRequests />
            </TabsContent>
            <TabsContent value="admin">
              <AdminPromotion />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function UserModeration() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/moderation-users')
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, action: 'approve' | 'reject') {
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
    <div className="max-w-5xl  w-full mx-auto ">
      <div className="rounded-3xl shadow-2xl shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-2 md:p-4">
        {users.map((u) => (
          <Card
            key={u.id}
            className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-6 p-6 rounded-3xl last:mb-0"
          >
            <div className="flex items-start md:items-center gap-4 flex-1">
              <UserCheck2 className="w-6 h-6 text-orange-500" />
              <div>
                <div className="font-semibold">
                  {u.name} <span className="text-gray-500">({u.email})</span>
                </div>
                <div className="text-xs text-gray-500">{u.city}</div>
                {!u.identityCardUrl && (
                  <div className="text-xs text-red-500 mt-1">
                    Aucune pièce d’identité fournie.
                  </div>
                )}
              </div>
              {u.identityCardUrl && (
                <a
                  href={u.identityCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 text-blue-600 underline text-sm"
                >
                  Voir la Carte d&apos;identité
                </a>
              )}
            </div>
            <div className="flex gap-2  mt-4 md:mt-0">
              <Button
                variant="outline"
                className="text-md"
                onClick={() => handleAction(u.id, 'approve')}
                disabled={!u.identityCardUrl} // disable if no ID provided
              >
                <Check className="w-4 h-4 mr-1" /> Valider
              </Button>
              <Button
                variant="destructive"
                className="text-md"
                onClick={() => handleAction(u.id, 'reject')}
              >
                <X className="w-4 h-4 mr-1" /> Refuser
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ------------- Service Bagages (Baggage Requests) -------------
function BaggageRequests() {
  const [requests, setRequests] = useState<BaggageRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/baggage')
      .then((res) => res.json())
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteRequest(id: string) {
    if (!window.confirm('Supprimer cette demande de service bagage ?')) return;
    const res = await fetch('/api/admin/baggage', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRequests((reqs) => reqs.filter((r) => r.id !== id));
      toast.success('Demande supprimée.');
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  }

  if (loading) return <div>Chargement…</div>;
  if (!requests.length) return <div>Aucune demande de service bagage.</div>;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8">
      <div className="rounded-3xl shadow-2xl shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-2 md:p-4">
        {requests.map((req) => (
          <Card
            key={req.id}
            className="flex rounded-3xl flex-col md:flex-row items-start md:justify-between mb-6 p-6 last:mb-0"
          >
            <div className="flex items-start gap-4 flex-1">
              <Package className="w-6 h-6 text-orange-500" />
              <div>
                <div className="font-semibold">
                  {req.name}{' '}
                  <span className="text-gray-500">({req.email})</span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatPhoneNumber(req.phone)}
                </div>

                <div className="text-xs text-gray-500">
                  Quantité: {req.quantity}
                </div>
                {req.message && (
                  <div className="text-sm text-gray-700 mt-2">
                    {req.message}
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-4 md:mt-0">
              <Button
                variant="destructive"
                className="text-xs"
                onClick={() => handleDeleteRequest(req.id)}
              >
                <Trash2 className="w-4 h-4 " /> Supprimer
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ------------- Signalements (Reports) -------------
function ReportsList() {
  const [reports, setReports] = useState<
    (Report & { ad: { id: string; title: string } })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then((res) => res.json())
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  async function handleIgnore(reportId: string) {
    // "Ignore" a report: delete it from the database
    const res = await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId }),
    });
    if (res.ok) {
      setReports((reps) => reps.filter((r) => r.id !== reportId));
      toast.success('Signalement ignoré (supprimé).');
    } else {
      toast.error("Erreur lors de l'opération.");
    }
  }

  async function handleDeleteAd(adId: string, reportId: string) {
    if (!window.confirm('Supprimer cette annonce signalée ?')) return;
    // Call existing moderate-ad endpoint to delete the ad (and cascade delete reports)
    const res = await fetch('/api/admin/moderate-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, action: 'delete' }),
    });
    if (res.ok) {
      // Remove the report from state (it will be gone due to cascade delete on the server)
      setReports((reps) => reps.filter((r) => r.id !== reportId));
      toast.success("Annonce supprimée (l'utilisateur en est averti).");
    } else {
      toast.error("Erreur lors de la suppression de l'annonce.");
    }
  }

  if (loading) return <div>Chargement…</div>;
  if (!reports.length) return <div>Aucun signalement en cours.</div>;

  // Helper to translate report reason enum to French for display
  const reasonLabels: Record<string, string> = {
    INAPPROPRIATE: 'Inapproprié',
    SCAM: 'Arnaque',
    SPAM: 'Spam',
    VIOLENCE: 'Violence',
    OTHER: 'Autre',
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8">
      <div className="rounded-[3rem] shadow-2xl shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-2 md:p-4">
        {reports.map((r) => (
          <Card
            key={r.id}
            className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-6 p-6 last:mb-0"
          >
            <div className="flex items-start gap-4 flex-1">
              <Flag className="w-6 h-6 text-orange-500" />
              <div>
                <div className="font-semibold text-sm">
                  Annonce :{' '}
                  <Link
                    href={`/annonce/${r.ad.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {r.ad.title}
                  </Link>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Raison :</span>{' '}
                  {reasonLabels[r.reason] ?? r.reason}
                </div>
                {r.message && (
                  <div className="text-sm">
                    <span className="font-semibold">Message :</span> {r.message}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => handleIgnore(r.id)}>
                <X className="w-4 h-4 mr-1" /> Ignorer
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteAd(r.ad.id, r.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Supprimer l'annonce
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SupportRequests() {
  const [requests, setRequests] = useState<
    {
      id: string;
      name: string;
      email: string;
      subject: string;
      message: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/support')
      .then((res) => res.json())
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement…</div>;
  if (!requests.length) return <div>Aucune demande de support.</div>;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8">
      <div className="rounded-[3rem] shadow-2xl shadow-[#0000001c] bg-white/90 backdrop-blur-xl p-2 md:p-4">
        {requests.map((req) => (
          <Card key={req.id} className="mb-6 p-6 rounded-3xl last:mb-0">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                Reçu le {new Date(req.createdAt).toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-orange-600">
                {req.subject}
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {req.message}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                De : {req.name} ({req.email})
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const res = await fetch('/api/admin/support', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: req.id }),
                    });
                    if (res.ok) {
                      setRequests((r) => r.filter((r) => r.id !== req.id));
                      toast.success('Marqué comme vu');
                    } else {
                      toast.error('Erreur');
                    }
                  }}
                >
                  Marquer comme vu
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ------------- Promouvoir Admin (Admin Promotion) -------------
function AdminPromotion() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then((res) => res.json()),
      fetch('/api/admin/users').then((res) => res.json()), // change ici l'URL correcte
    ])
      .then(([me, admins]) => {
        setCurrentUser(me);
        if (Array.isArray(admins)) setAdmins(admins);
      })
      .catch((err) => console.error(err));
  }, []);

  async function promoteAdmin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const res = await fetch('/api/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Promotion de ${email} réussie !`);
      setEmail('');
      // Optionally update the local admins list:
      if (data.success) {
        // If the API returned success, add this user to the admins list in state
        setAdmins((prev) => {
          const alreadyListed = prev.find(
            (u) => u.email === email.toLowerCase()
          );
          if (alreadyListed) {
            return prev; // already in list
          }
          // Otherwise, push a new admin entry (simplified, real implementation might need to refetch list)
          return [...prev, { ...data.user, isAdmin: true } as User];
        });
      }
    } else {
      setError(data.error || 'Erreur lors de la promotion');
    }
  }

  async function removeAdmin(adminEmail: string) {
    if (!window.confirm(`Retirer les droits admin de ${adminEmail} ?`)) return;
    const res = await fetch('/api/admin/demote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      setAdmins((prev) => prev.filter((u) => u.email !== adminEmail));
      toast.success(`${adminEmail} n'est plus admin.`);
    } else {
      toast.error(data.error || 'Erreur lors de la révocation.');
    }
  }

  return (
    <div className="max-w-xl w-full mx-auto space-y-6">
      {/* Promotion Form */}
      <Card className="p-6 rounded-3xl">
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
            {msg && <div className="text-sm text-green-600 mt-2">{msg}</div>}
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          </form>
        </CardContent>
      </Card>
      {/* Current Admins List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Administrateurs actuels</h2>
        {admins.map((admin) => (
          <Card
            key={admin.id}
            className="flex rounded-3xl flex-col md:flex-row items-center md:justify-between mb-4 p-4"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-semibold">{admin.name || admin.email}</div>
                <div className="text-xs text-gray-500">{admin.email}</div>
              </div>
            </div>
            {currentUser?.isSuperAdmin && !admin.isSuperAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeAdmin(admin.email)}
              >
                <X className="w-4 h-4 mr-1" /> Retirer
              </Button>
            )}
          </Card>
        ))}
        {admins.length === 0 && (
          <p className="text-sm text-gray-600">
            Aucun autre admin pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
