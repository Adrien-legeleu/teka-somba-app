import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
): Promise<NextResponse> {
  const { adId } = await params;

  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    select: { userId: true },
  });
  if (!ad) {
    return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
  }
  if (ad.userId !== userId) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  const analytics = await prisma.adAnalytics.findUnique({ where: { adId } });
  return NextResponse.json(
    analytics ?? {
      views: 0,
      uniqueViews: 0,
      favoritesCount: 0,
      messagesCount: 0,
    }
  );
}
