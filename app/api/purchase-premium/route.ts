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

  if (user.credit < offer.price) {
    return NextResponse.json(
      { error: 'Crédits insuffisants' },
      { status: 400 }
    );
  }

  // Déduit les crédits
  await prisma.user.update({
    where: { id: userId },
    data: { credit: { decrement: offer.price } },
  });

  // Applique l'effet selon le type d'offre
  if (offer.title.toLowerCase().includes('hebdo')) {
    await prisma.ad.update({
      where: { id: adId },
      data: {
        createdAt: new Date(), // Remonte dans le fil
        boostUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
        boostType: 'hebdo',
      },
    });
  } else if (offer.title.toLowerCase().includes('journalier')) {
    await prisma.ad.update({
      where: { id: adId },
      data: {
        createdAt: new Date(),
        boostUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 jour
        boostType: 'journalier',
      },
    });
  } else if (offer.title.toLowerCase().includes('vip')) {
    await prisma.ad.update({
      where: { id: adId },
      data: {
        isVip: true,
        boostUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        boostType: 'vip',
      },
    });
  }
  await prisma.premiumPurchase.create({
    data: {
      userId,
      offerId,
      adId,
    },
  });

  return NextResponse.json({ success: true });
}
