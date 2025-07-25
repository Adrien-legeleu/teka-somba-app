// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest();

  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, prenom: true, email: true, isAdmin: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  // Seuls les users NON validés et NON rejetés apparaissent
  const users = await prisma.user.findMany({
    where: { isVerified: false, isRejected: false },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      identityCardUrl: true,
    },
  });
  return NextResponse.json(users);
}
