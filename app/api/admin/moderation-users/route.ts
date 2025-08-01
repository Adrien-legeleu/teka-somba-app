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

  const usersToModerate = await prisma.user.findMany({
    where: {
      isVerified: false,
      isRejected: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      identityCardUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(usersToModerate);
}
