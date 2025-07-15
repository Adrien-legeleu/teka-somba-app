import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user)
    return NextResponse.json(
      { error: 'Token invalide ou expiré' },
      { status: 400 }
    );
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, resetToken: null, resetTokenExpiry: null },
  });
  return NextResponse.json({ message: 'Mot de passe réinitialisé' });
}
