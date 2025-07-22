// POST: { adId, action: 'delete' }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function POST(req: NextRequest) {
  const { adId, action } = await req.json();
  const userId = await getUserIdFromRequest();

  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, prenom: true, email: true, isAdmin: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    include: { user: true },
  });
  if (!ad)
    return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

  if (action === 'delete') {
    await prisma.ad.delete({ where: { id: adId } });
    await sendEmail(
      ad.user.email,
      'Annonce supprimée',
      `Votre annonce "${ad.title}" a été supprimée par l’équipe d’administration.`
    );
  }

  return NextResponse.json({ success: true });
}
