import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/ui/aurora-background';
import {
  UserCircle,
  Heart,
  MessageCircle,
  List,
  Settings,
  LogOut,
  FileText,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    redirect('/login');
  }

  const userId = (payload as any).userId;
  if (!userId) redirect('/login');

  // Récupération du vrai user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      city: true,
      prenom: true,
      avatar: true,
      age: true,
      isAdmin: true,
    },
  });
  if (!user) redirect('/login');

  return (
    <AuroraBackground>
      <div className="flex flex-col w-full min-h-screen items-center py-14 px-2">
        {/* En-tête profil + solde */}
        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl bg-white/50 border border-[#ffbf00]/30 rounded-3xl p-7 mb-10 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#ffbf00] flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-xl">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                user.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xl">
                  {user.prenom} {user.name}
                </span>
                {user.isAdmin && (
                  <Link
                    href={'/admin'}
                    className="bg-[#ffbf00]/20 px-2 py-0.5 text-xs rounded-full text-[#ec5d22] font-semibold"
                  >
                    admin★
                  </Link>
                )}
                <span className="text-gray-500 text-sm">{user.age}</span>
              </div>
              <div className="text-sm text-gray-500">{user.city}</div>
              <Button
                className="mt-2 bg-[var(--color-accent)] text-white hover:bg-[var(--color-primary)] px-4 py-1"
                variant="ghost"
                size="sm"
              >
                Modifier le profil
              </Button>
            </div>
          </div>
          {/* Porte-monnaie */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-gray-600 text-sm">Porte-monnaie</div>
            <div className="text-3xl font-bold text-[var(--color-secondary)]">
              0,00 €
            </div>
            <div className="text-xs text-gray-400">Solde disponible</div>
            <Button
              className="mt-2 text-[var(--color-accent)] border-[var(--color-accent)] bg-white/60 hover:bg-[var(--color-primary)] hover:text-white transition-all"
              variant="outline"
              size="sm"
            >
              Ajouter de l’argent
            </Button>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardCard
            title="Annonces"
            desc="Gérer mes annonces déposées"
            icon={<List size={36} />}
            href="/dashboard/annonces"
          />
          <DashboardCard
            title="Favoris"
            desc="Retrouver tous mes favoris"
            icon={<Heart size={36} />}
            href="/dashboard/favoris"
          />
          <DashboardCard
            title="Messages"
            desc="Mes échanges avec la communauté"
            icon={<MessageCircle size={36} />}
            href="/dashboard/messages"
          />
          <DashboardCard
            title="Profil & Espaces"
            desc="Modifier mon profil, voir mes avis"
            icon={<UserCircle size={36} />}
            href="/dashboard/profil"
          />
          <DashboardCard
            title="Paramètres"
            desc="Mes infos et préférences"
            icon={<Settings size={36} />}
            href="/dashboard/parametres"
          />
          <DashboardCard
            title="Factures"
            desc="Consulter mes factures"
            icon={<FileText size={36} />}
            href="/dashboard/factures"
          />
          <DashboardCard
            title="Aide"
            desc="Questions fréquentes, support"
            icon={<HelpCircle size={36} />}
            href="/faq"
            external
          />
        </div>

        {/* Déconnexion */}
        <form action="/api/auth/logout" method="POST">
          <Button
            type="submit"
            className="bg-white/50 backdrop-blur-xl border text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white border-[var(--color-accent)] rounded-full px-8 py-2 font-semibold transition-all flex gap-2 items-center"
            variant="outline"
          >
            <LogOut size={18} /> Me déconnecter
          </Button>
        </form>
      </div>
    </AuroraBackground>
  );
}

// Composant Card Réutilisable
function DashboardCard({
  title,
  desc,
  icon,
  href,
  external = false,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group relative rounded-3xl bg-white/80 border border-[#ffbf00]/10 p-7 flex flex-col items-start gap-2 shadow-xl hover:scale-[1.03] transition-all min-h-[150px] focus:ring-2 ring-[var(--color-primary)]"
    >
      <div className="rounded-xl bg-[var(--color-primary)] text-white p-2 shadow">
        {icon}
      </div>
      <div className="font-semibold text-lg text-[var(--color-secondary)]">
        {title}
      </div>
      <div className="text-gray-500 text-sm">{desc}</div>
      <span className="absolute top-5 right-5 text-[var(--color-accent)] text-xl opacity-0 group-hover:opacity-80 transition-opacity">
        →
      </span>
    </Link>
  );
}
