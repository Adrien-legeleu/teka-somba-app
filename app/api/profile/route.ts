// app/api/profile/route.ts
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      prenom: true,
      city: true,
      age: true,
      email: true,
      phone: true,
      avatar: true,
      identityCardUrl: true,
      isVerified: true,
      isRejected: true,
    },
  });

  if (!user)
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { name, prenom, city, age, phone, avatar, identityCardUrl } =
    await req.json();

  // Correction : convertis age en number (ou null si vide/NaN)
  const parsedAge =
    age === '' || age === undefined || age === null
      ? null
      : isNaN(Number(age))
        ? null
        : Number(age);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      prenom,
      city,
      age: parsedAge,
      phone,
      ...(avatar ? { avatar } : {}),
      ...(identityCardUrl
        ? { identityCardUrl, isVerified: false, isRejected: false }
        : {}),
    },
  });
  return NextResponse.json({ success: true, user });
}

export async function PATCH(req: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user)
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match)
    return NextResponse.json(
      { error: 'Mot de passe actuel incorrect' },
      { status: 401 }
    );

  if (newPassword.length < 8)
    return NextResponse.json(
      { error: 'Le nouveau mot de passe doit faire au moins 8 caractères.' },
      { status: 400 }
    );

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}
