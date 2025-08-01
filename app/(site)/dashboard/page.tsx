import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { prisma } from '@/lib/prisma';

import AnalyticsDashboard from '@/app/components/Fonctionnalities/DashboardAnalyticsClient';
import DashboardCard from '@/app/components/Dashboard/DashboardCard';
import DashboardHeader from '@/app/components/Dashboard/Dashbaordheader';
export const runtime = 'nodejs';

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  let payload: JWTPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    redirect('/login');
  }

  const userId = payload.userId;
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
      credit: true,
    },
  });

  if (!user) redirect('/login');

  return (
    <div>
      <div className="flex flex-col w-full min-h-screen items-center pb-14 ">
        <div className="w-full flex border-b px-2 items-center justify-center bg-neutral-50 md:pt-20 md:pb-5">
          <DashboardHeader user={user} />
        </div>

        <div className="w-full max-w-5xl px-2 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          {[
            {
              title: 'Annonces',
              desc: 'Gérer mes annonces déposées',
              emoji: '📢',
              href: '/dashboard/annonces',
            },
            {
              title: 'Favoris',
              desc: 'Retrouver tous mes favoris',
              emoji: '❤️',
              href: '/dashboard/favoris',
            },
            {
              title: 'Messages',
              desc: 'Mes échanges avec la communauté',
              emoji: '💬',
              href: '/dashboard/messages',
            },
            {
              title: 'Profil & Espaces',
              desc: 'Modifier mon profil, voir mes avis',
              emoji: '🙋‍♂️',
              href: '/dashboard/profil',
            },
            {
              title: 'Votre Wallet',
              desc: 'Les fonctionnalités Premiums',
              emoji: '💳',
              href: '/dashboard/wallet',
            },
            {
              title: 'Factures',
              desc: 'Consulter mes factures',
              emoji: '🧾',
              href: '/dashboard/factures',
            },
            {
              title: 'Aide',
              desc: 'Questions fréquentes, support',
              emoji: '❓',
              href: '/dashboard/support',
              external: true,
            },
          ].map((card, i) => (
            <DashboardCard key={i} {...card} index={i} />
          ))}
        </div>

        <div className="w-full max-w-5xl mx-auto p-4 pb-10">
          <AnalyticsDashboard />
        </div>
        <form action="/api/auth/logout" method="POST">
          <Button
            type="submit"
            className="bg-white/90 backdrop-blur-xl border text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white border-[var(--color-accent)] rounded-full px-8 py-2 font-semibold transition-all flex gap-2 items-center"
            variant="outline"
          >
            <LogOut size={18} /> Me déconnecter
          </Button>
        </form>
      </div>
    </div>
  );
}
