import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function POST(req: NextRequest) {
  try {
    // 🔒 Auth admin centralisée
    await requireAdmin();

    // 4️⃣ Récupère les infos du body
    const { userId, action } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, prenom: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // 5️⃣ Approuve ou refuse
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
      await sendEmail(
        user.email,
        'Votre compte a été validé',
        "Bonne nouvelle ! Votre compte a été vérifié par l'équipe d'administration. Vous pouvez continuer à utiliser la plateforme en toute confiance."
      );
    } else if (action === 'reject') {
      await prisma.user.delete({ where: { id: userId } });
      await sendEmail(
        user.email,
        'Votre compte a été refusé',
        'Votre compte a été refusé par l’administrateur. Veuillez vérifier votre pièce d’identité et réessayer.'
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (error instanceof Error && error.message === '403')
      return NextResponse.json(
        { error: 'Accès refusé (admin requis)' },
        { status: 403 }
      );
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
