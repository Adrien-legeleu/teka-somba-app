import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json(
      { error: 'Identifiants incorrects' },
      { status: 401 }
    );

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return NextResponse.json(
      { error: 'Identifiants incorrects' },
      { status: 401 }
    );

  const token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: '2h' }
  );

  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 10,
  });
  return res;
}
