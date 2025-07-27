import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const name = formData.get('name')?.toString();
  const prenom = formData.get('prenom')?.toString();
  const phone = formData.get('phone')?.toString();
  const city = formData.get('city')?.toString();
  const birthdate = formData.get('birthdate')?.toString();
  const identityFile = formData.get('identityCard') as File;

  if (
    !email ||
    !password ||
    !identityFile ||
    !phone ||
    !city ||
    !prenom ||
    !name
  ) {
    return NextResponse.json(
      { error: 'Champs requis manquants.' },
      { status: 400 }
    );
  }

  // Vérifie que l'email n'existe pas déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email déjà utilisé.' }, { status: 400 });
  }

  const existingPending = await prisma.pendingUser.findUnique({
    where: { email },
  });
  if (existingPending) {
    await prisma.pendingUser.delete({ where: { email } }); // Supprime l’ancien en attente
  }

  const hash = await bcrypt.hash(password, 12);

  const upload = await put(
    `identity-cards/${Date.now()}-${identityFile.name}`,
    identityFile,
    { access: 'public' }
  );

  const identityCardUrl = upload.url;
  const otp = crypto.randomInt(100000, 999999).toString(); // OTP à 6 chiffres

  await prisma.pendingUser.create({
    data: {
      email,
      passwordHash: hash,
      name,
      prenom,
      phone,
      city,
      identityCardUrl,
      birthdate: birthdate ? new Date(birthdate) : null,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // expire 10 min
    },
  });

  await sendEmail(email, 'Code de vérification', `Votre code est : ${otp}`);

  return NextResponse.json({ success: true });
}
