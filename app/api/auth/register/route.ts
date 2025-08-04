import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD') // Décompose les accents
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-zA-Z0-9.-]/g, '-') // Remplace tout ce qui n’est pas lettre, chiffre, point ou tiret par un tiret
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprime tirets en début ou fin
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const name = formData.get('name')?.toString();
  const prenom = formData.get('prenom')?.toString();
  const phone = formData.get('phone')?.toString();
  const age = formData.get('age')?.toString();
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

  // Nettoyage du nom de fichier
  const safeFileName = sanitizeFilename(identityFile.name);

  // Conversion du File en buffer pour Supabase
  const arrayBuffer = await identityFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Chemin dans le bucket Supabase
  const filePath = `identity-cards/${Date.now()}-${safeFileName}`;

  // Upload sur Supabase Storage, bucket "images"
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: identityFile.type || 'image/jpeg',
    });

  console.log({ data, error });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // URL publique du fichier uploadé
  const identityCardUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;

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
      age: age ? parseInt(age) : null,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // expire 10 min
    },
  });

  await sendEmail(email, 'Code de vérification', `Votre code est : ${otp}`);

  return NextResponse.json({ success: true });
}
