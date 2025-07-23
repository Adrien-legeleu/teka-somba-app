import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { offerId, adId } = await req.json();

  const [offer, user, ad] = await Promise.all([
    prisma.premiumOffer.findUnique({ where: { id: offerId } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.ad.findUnique({ where: { id: adId } }),
  ]);

  if (!offer || !user || !ad) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  if (user.credit < offer.points) {
    return NextResponse.json(
      { error: 'Crédits insuffisants' },
      { status: 400 }
    );
  }

  // Déduit les crédits
  await prisma.user.update({
    where: { id: userId },
    data: { credit: { decrement: offer.points } },
  });

  // Applique l'effet selon l’offre
  if (offer.title.includes('hebdo')) {
    await prisma.ad.update({
      where: { id: adId },
      data: { createdAt: new Date() },
    });
  }

  // Tu pourras ensuite gérer les autres effets ici : badge VIP, boost journalier, etc.

  return NextResponse.json({ success: true });
}
