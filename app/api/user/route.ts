import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';

type AuthPayload = JwtPayload & { userId: string };

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let payload: AuthPayload;
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  const userId = payload.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      age: true,
      avatar: true,
      isVerified: true,
      isAdmin: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}
