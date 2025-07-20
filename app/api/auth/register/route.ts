import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { put } from '@vercel/blob'; // Pour l'upload cloud
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const name = formData.get('name')?.toString();
  const prenom = formData.get('prenom')?.toString();
  const phone = formData.get('phone')?.toString();
  const city = formData.get('city')?.toString();
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

  const hash = await bcrypt.hash(password, 12);

  const upload = await put(
    `identity-cards/${Date.now()}-${identityFile.name}`,
    identityFile,
    { access: 'public' }
  );

  const identityCardUrl = upload.url;

  await prisma.user.create({
    data: {
      email,
      password: hash,
      name,
      prenom,
      phone,
      city,
      identityCardUrl,
      isVerified: false,
      isRejected: false,
    },
  });

  await sendEmail(
    email,
    'Inscription en attente de validation',
    `Bonjour, votre inscription est prise en compte. Votre compte sera validé après vérification manuelle de votre carte d'identité.`
  );

  return NextResponse.json({ success: true });
}
