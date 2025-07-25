// app/api/ad/user/boosted/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const ads = await prisma.ad.findMany({
      where: {
        userId,
        boostUntil: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        boostUntil: true,
        boostType: true,
        images: true,
      },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error('[BoostedAdsError]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
