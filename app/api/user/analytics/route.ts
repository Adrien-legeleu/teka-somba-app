import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const ads = await prisma.ad.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      adAnalytics: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(ads);
}
