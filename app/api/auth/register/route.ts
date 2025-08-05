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

  await sendEmail(
    email,
    'Teka Somba — Code de vérification (valide 10 min)',
    `
  <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #1f2937; background: #ffffff; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="text-align:center; margin-bottom: 16px;">
        <a href="https://teka-somba.com" target="_blank" style="text-decoration:none; color:#ff6600; font-weight:700; font-size:20px;">Teka Somba</a>
      </div>

      <p>Bonjour${prenom ? ' <strong>' + prenom + '</strong>' : name ? ' <strong>' + name + '</strong>' : ''},</p>
      <p>Voici votre <strong>code de vérification</strong> pour finaliser la création de votre compte&nbsp;:</p>

      <div style="text-align:center; margin: 20px 0;">
        <div style="display:inline-block; font-size: 28px; font-weight: 700; letter-spacing: 4px; padding: 12px 20px; border: 2px dashed #ff6600; border-radius: 10px;">
          ${otp}
        </div>
      </div>

      <p style="font-size:14px; color:#6b7280;">
        ⏱️ Ce code est valable <strong>10 minutes</strong>. Saisissez‑le sur la page d’inscription pour confirmer votre adresse e‑mail.
      </p>

      <p style="font-size:14px; color:#6b7280;">
        Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e‑mail.
      </p>

      <p style="font-size:14px; color:#6b7280;">
        Besoin d’aide&nbsp;? Contactez‑nous&nbsp;: 
        <a href="mailto:tekasomba_official@hotmail.com" style="color:#1a73e8; text-decoration:none;">tekasomba_official@hotmail.com</a>
      </p>

      <p>Cordialement,<br/>L’équipe <strong>Teka Somba</strong></p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
      <p style="font-size:12px; color:#9ca3af; margin:0;">
        Cet e‑mail a été envoyé automatiquement par 
        <a href="https://teka-somba.com" target="_blank" style="color:#9ca3af; text-decoration:none;">teka-somba.com</a>.
      </p>
    </div>
  </div>
  `
  );

  return NextResponse.json({ success: true });
}
