import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const [transactions, purchases] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.premiumPurchase.findMany({
        where: { userId },
        include: {
          offer: true,
          ad: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ transactions, purchases });
  } catch (error) {
    console.error('[FactureError]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
