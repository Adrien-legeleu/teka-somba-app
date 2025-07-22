import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function POST(req: Request) {
  // Récupère l'utilisateur connecté (null si pas connecté, mais la page est protégée)
  const userId = await getUserIdFromRequest();

  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
  }

  // Va chercher les infos du user
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

  const fullName = [user.prenom, user.name].filter(Boolean).join(' ');

  const helpRequest = await prisma.helpRequest.create({
    data: {
      userId,
      name: fullName,
      email: user.email,
      message,
      subject,
    },
  });

  return NextResponse.json({ success: true, helpRequest });
}
