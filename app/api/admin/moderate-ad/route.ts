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
      'Annonce supprimée par l’équipe Teka Somba',
      `
  <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
    <p>Bonjour <strong>${ad.user.prenom ?? ad.user.name}</strong>,</p>

    <p>Nous vous informons que votre annonce intitulée <strong>"${ad.title}"</strong> a été supprimée par notre équipe de modération.</p>

    <p>Cette décision a été prise dans le respect des <a href="https://teka-somba.com/conditions-generales" target="_blank">règles d’utilisation</a> de la plateforme Teka Somba.<br/>
    Elle peut faire suite à un signalement, à un non-respect de nos conditions générales, ou à une incohérence dans le contenu publié.</p>

    <p>Si vous pensez qu’il s’agit d’une erreur ou que vous souhaitez obtenir des précisions, vous pouvez nous écrire à 
    <a href="mailto:tekasomba_official@hotmail.com" style="color: #1a73e8;">tekasomba_official@hotmail.com</a></p>

    <p>Merci de votre compréhension,<br/>
    L’équipe <a href="https://teka-somba.com" target="_blank" style="color: #ff6600; text-decoration: none;"><strong>Teka Somba</strong></a></p>
  </div>
  `
    );
  }

  return NextResponse.json({ success: true });
}
