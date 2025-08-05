import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export const runtime = 'nodejs';

export async function DELETE() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1) Lister les annonces du user (utile pour PremiumPurchase)
      const ads = await tx.ad.findMany({
        where: { userId },
        select: { id: true },
      });
      const adIds = ads.map((a) => a.id);

      // 2) Supprimer les PremiumPurchase avant de supprimer les annonces (pas de cascade dans ton schéma)
      await tx.premiumPurchase.deleteMany({
        where: {
          OR: [
            { userId }, // achats effectués par l'utilisateur
            adIds.length ? { adId: { in: adIds } } : { adId: '' }, // achats liés à ses annonces
          ],
        },
      });

      // 3) Supprimer les favoris du user (ses bookmarks)
      await tx.favorite.deleteMany({ where: { userId } });
      // (les favoris pointant vers ses annonces seront de toute façon supprimés via onDelete: Cascade(Favorite -> Ad))

      // 4) Supprimer tous ses messages (envoyés ou reçus)
      await tx.message.deleteMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      });
      // (les messages rattachés à ses annonces seront aussi supprimés via Cascade(Message -> Ad))

      // 5) Notifications, Wallet, HelpRequests
      await tx.notification.deleteMany({ where: { userId } });
      await tx.walletTransaction.deleteMany({ where: { userId } });
      await tx.helpRequest.deleteMany({ where: { userId } });

      // 6) Supprimer ses annonces (cascade pour AdAnalytics, AdField, Favorite(adId), Report, Message(adId))
      await tx.ad.deleteMany({ where: { userId } });

      // 7) Supprimer l'utilisateur
      await tx.user.delete({ where: { id: userId } });
    });

    // Invalider le cookie JWT
    const res = NextResponse.json({ ok: true });
    res.headers.append(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );
    return res;
  } catch (e) {
    console.error('[DELETE ACCOUNT] error:', e);
    return NextResponse.json(
      { error: 'Impossible de supprimer le compte' },
      { status: 500 }
    );
  }
}
