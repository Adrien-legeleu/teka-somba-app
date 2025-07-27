import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  const pending = await prisma.pendingUser.findUnique({ where: { email } });
  if (!pending) {
    return NextResponse.json(
      { error: 'Inscription non trouvée' },
      { status: 404 }
    );
  }

  if (pending.otp !== otp) {
    return NextResponse.json({ error: 'Code incorrect' }, { status: 400 });
  }

  if (pending.otpExpiry < new Date()) {
    return NextResponse.json({ error: 'Code expiré' }, { status: 400 });
  }

  // Créer le user
  await prisma.user.create({
    data: {
      email: pending.email,
      password: pending.passwordHash,
      name: pending.name,
      prenom: pending.prenom,
      phone: pending.phone,
      city: pending.city,
      identityCardUrl: pending.identityCardUrl,
      isVerified: true,
      isRejected: false,
    },
  });

  // Supprimer l'entrée PendingUser
  await prisma.pendingUser.delete({ where: { email } });

  return NextResponse.json({ success: true });
}
