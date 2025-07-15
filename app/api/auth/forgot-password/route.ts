import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry: expires },
    });
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Réinitialisation du mot de passe',
      `Cliquez sur ce lien pour réinitialiser : ${link}`
    );
  }
  return NextResponse.json({
    message: 'Si ce mail existe, un lien a été envoyé.',
  });
}
