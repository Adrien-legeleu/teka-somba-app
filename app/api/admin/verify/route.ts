// app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, action } = await req.json();
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (!(payload as any).isAdmin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user)
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );

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
}
