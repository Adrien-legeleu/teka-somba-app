import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest();

  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // ✅ On récupère tous les users qui sont admins, peu importe leur état
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      identityCardUrl: true,
    },
    orderBy: { email: 'asc' },
  });

  return NextResponse.json(admins);
}
