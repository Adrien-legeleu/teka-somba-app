import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  const userId = (payload as any).userId;
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // On ne retourne que les infos utiles pour le dashboard
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

  if (!user)
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );

  return NextResponse.json(user);
}
