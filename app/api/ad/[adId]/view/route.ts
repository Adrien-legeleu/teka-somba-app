import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ adId: string }> }
) {
  const { adId } = await ctx.params;

  const cookieName = `ad_${adId}_viewed`;
  const alreadyViewed = req.cookies.get(cookieName);
  const shouldIncUnique = !alreadyViewed;

  // **1 seul upsert** : crée la ligne ou incrémente directement
  await prisma.adAnalytics.upsert({
    where: { adId },
    create: {
      adId,
      views: 1,
      uniqueViews: shouldIncUnique ? 1 : 0,
    },
    update: {
      views: { increment: 1 },
      ...(shouldIncUnique ? { uniqueViews: { increment: 1 } } : {}),
    },
  });

  // Réponse + cookie si unique view
  const res = NextResponse.json({ ok: true });

  if (shouldIncUnique) {
    res.cookies.set(cookieName, '1', {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 24h
      sameSite: 'lax',
      path: '/',
    });
  }

  return res;
}
