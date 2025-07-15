import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password, name, phone, city, avatar } = await req.json();
  if (!email || !password)
    return NextResponse.json(
      { error: 'Email & mot de passe requis' },
      { status: 400 }
    );

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, phone, city, avatar },
  });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
