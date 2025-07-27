import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();
  const pending = await prisma.pendingUser.findUnique({ where: { email } });

  if (!pending) {
    return NextResponse.json(
      { error: 'Inscription non trouvée' },
      { status: 404 }
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  await prisma.pendingUser.update({
    where: { email },
    data: { otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) },
  });

  await sendEmail(
    email,
    'Nouveau code de vérification',
    `Votre nouveau code est : ${otp}`
  );
  return NextResponse.json({ success: true });
}
