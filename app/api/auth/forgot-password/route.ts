import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry: expires },
    });
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Teka Somba — Réinitialisation de votre mot de passe',
      `
  <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #1f2937; background: #ffffff; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="text-align:center; margin-bottom: 16px;">
        <a href="https://teka-somba.com" target="_blank" style="text-decoration:none; color:#ff6600; font-weight:700; font-size:20px;">Teka Somba</a>
      </div>

      <p>Bonjour${user?.prenom ? ' <strong>' + user.prenom + '</strong>' : user?.name ? ' <strong>' + user.name + '</strong>' : ''},</p>
      <p>Nous avons reçu une demande de <strong>réinitialisation de mot de passe</strong> pour votre compte.</p>
      <p>Pour définir un nouveau mot de passe, cliquez sur le bouton ci‑dessous&nbsp;:</p>

      <p style="margin: 24px 0;">
        <a href="${link}" target="_blank"
           style="display:inline-block; padding:12px 20px; background:#ff6600; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">
          Réinitialiser mon mot de passe
        </a>
      </p>

      <p style="font-size:14px; color:#374151; word-break:break-all; margin-top: 8px;">
        Ou copiez/collez ce lien dans votre navigateur&nbsp;:<br />
        <a href="${link}" target="_blank" style="color:#1a73e8; text-decoration:none;">${link}</a>
      </p>

      <p style="font-size:14px; color:#6b7280;">
        🔐 Pour votre sécurité, ce lien est valable <strong>1&nbsp;heure</strong> et ne peut être utilisé qu’une seule fois.
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
  }
  return NextResponse.json({
    message: 'Si ce mail existe, un lien a été envoyé.',
  });
}
