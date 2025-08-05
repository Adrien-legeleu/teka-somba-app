// app/api/admin/promote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email'; // ajoute ceci

import { requireAdmin } from '@/lib/requireAdmin'; // ajoute ça

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(); // <<== AJOUT ICI
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    // Envoi d'un email de notification promotion admin
    await sendEmail(
      email,
      'Teka Somba — Votre compte a été promu administrateur',
      `
  <div style="font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:1.6; color:#1f2937; background:#ffffff; padding:24px;">
    <div style="max-width:640px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:16px;">
        <a href="https://teka-somba.com" target="_blank" style="text-decoration:none; color:#ff6600; font-weight:700; font-size:20px;">
          Teka Somba
        </a>
      </div>

      <p>Bonjour <strong>${user?.prenom ?? user?.name ?? ''}</strong>,</p>

      <p>Bonne nouvelle&nbsp;! Votre compte vient d’être <strong>promu administrateur</strong> sur la plateforme <a href="https://teka-somba.com" target="_blank" style="color:#ff6600; text-decoration:none;">Teka Somba</a>.</p>

      <p>Vous pouvez dès maintenant accéder à l’interface d’administration pour gérer les annonces, les utilisateurs et la modération.</p>

      <p style="margin:24px 0;">
        <a href="https://teka-somba.com/admin" target="_blank"
           style="display:inline-block; padding:12px 18px; background:#ff6600; color:#ffffff; border-radius:8px; text-decoration:none; font-weight:600;">
          Accéder à l’admin
        </a>
      </p>

      <p style="font-size:14px; color:#6b7280;">
        Si vous n’êtes pas à l’origine de cette action, contactez immédiatement notre équipe&nbsp;:
        <a href="mailto:tekasomba_official@hotmail.com" style="color:#1a73e8; text-decoration:none;">
          tekasomba_official@hotmail.com
        </a>
      </p>

      <p>Merci et bienvenue dans l’équipe d’administration,<br/>
      L’équipe <strong>Teka Somba</strong></p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />

      <p style="font-size:12px; color:#9ca3af; margin:0;">
        Cet e‑mail a été envoyé automatiquement par Teka Somba — <a href="https://teka-somba.com" target="_blank" style="color:#9ca3af; text-decoration:none;">teka-somba.com</a>.
      </p>
    </div>
  </div>
  `
    );

    return NextResponse.json({
      success: true,
      message: `${email} est maintenant admin.`,
    });
  } catch (err) {
    if (err instanceof Error && err.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (err instanceof Error && err.message === '403')
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
