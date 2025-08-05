import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();
  const pending = await prisma.pendingUser.findUnique({ where: { email } });

  if (!pending) {
    return NextResponse.json(
      { error: 'Inscription non trouvée' },
      { status: 404 }
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  await prisma.pendingUser.update({
    where: { email },
    data: { otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) },
  });

  await sendEmail(
    email,
    'Teka Somba — Nouveau code de vérification (valide 10 min)',
    `
  <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #1f2937; background: #ffffff; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="text-align:center; margin-bottom: 16px;">
        <a href="https://teka-somba.com" target="_blank" style="text-decoration:none; color:#ff6600; font-weight:700; font-size:20px;">Teka Somba</a>
      </div>

      <p>Voici votre <strong>nouveau code de vérification</strong> :</p>

      <div style="text-align:center; margin: 20px 0;">
        <div style="display:inline-block; font-size: 28px; font-weight: 700; letter-spacing: 4px; padding: 12px 20px; border: 2px dashed #ff6600; border-radius: 10px;">
          ${otp}
        </div>
      </div>

      <p style="font-size:14px; color:#6b7280;">
        ⏱️ Ce code est valable <strong>10 minutes</strong>. Saisissez‑le sur la page d’inscription pour vérifier votre adresse e‑mail.
      </p>

      <p style="font-size:14px; color:#6b7280;">
        Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet e‑mail.
      </p>

      <p style="font-size:14px; color:#6b7280;">
        Besoin d’aide ? Écrivez‑nous :
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
