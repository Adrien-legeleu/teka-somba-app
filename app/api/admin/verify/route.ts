import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function POST(req: NextRequest) {
  try {
    // 🔒 Auth admin centralisée
    await requireAdmin();

    // 4️⃣ Récupère les infos du body
    const { userId, action } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, prenom: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // 5️⃣ Approuve ou refuse
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
      await sendEmail(
        user.email,
        'Teka Somba — Votre compte a été validé',
        `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; line-height: 1.6; background: #ffffff; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto;">
      <p>Bonjour <strong>${user.prenom ?? user.name}</strong>,</p>

      <p>Bonne nouvelle&nbsp;! Votre compte vient d’être <strong>validé</strong> par notre équipe d’administration.</p>

      <p>Vous pouvez désormais utiliser pleinement la plateforme Teka Somba pour publier, gérer ou promouvoir vos annonces en toute confiance.</p>

      <p style="margin: 24px 0;">
        <a href="https://teka-somba.com" target="_blank" style="background-color: #ff6600; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold;">
          Accéder à Teka Somba
        </a>
      </p>

      <p style="font-size: 14px; color: #6b7280;">
        En utilisant notre site, vous acceptez les&nbsp;
        <a href="https://teka-somba.com/conditions-generales" target="_blank" style="color: #1a73e8;">Conditions Générales</a>, 
        <a href="https://teka-somba.com/mentions-legales" target="_blank" style="color: #1a73e8;">Mentions Légales</a> et 
        <a href="https://teka-somba.com/politique-confidentialite" target="_blank" style="color: #1a73e8;">la Politique de Confidentialité</a>.
      </p>

      <p>Cordialement,<br/>L’équipe <strong>Teka Somba</strong></p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 32px;" />
      <p style="font-size: 12px; color: #9ca3af;">Expéditeur : <a href="mailto:tekasomba_official@hotmail.com" style="color: #9ca3af;">tekasomba_official@hotmail.com</a></p>
    </div>
  </div>
  `
      );
    } else if (action === 'reject') {
      await prisma.user.delete({ where: { id: userId } });
      await sendEmail(
        user.email,
        'Teka Somba — Vérification refusée',
        `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; line-height: 1.6; background: #ffffff; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto;">
      <p>Bonjour <strong>${user.prenom ?? user.name}</strong>,</p>

      <p>Votre demande de vérification de compte a été <span style="color: #d32f2f;"><strong>refusée</strong></span> par notre équipe d’administration.</p>

      <p>Il est possible que votre document d’identité soit flou, incomplet ou non conforme. Vous pouvez recommencer votre démarche à tout moment avec un document plus clair.</p>

      <p style="margin: 24px 0;">
        <a href="https://teka-somba.com/mon-compte/verification" target="_blank" style="background-color: #ff6600; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold;">
          Refaire ma vérification
        </a>
      </p>

      <p style="font-size: 14px; color: #6b7280;">
        Besoin d’aide ? Écrivez-nous à 
        <a href="mailto:tekasomba_official@hotmail.com" style="color: #1a73e8;">tekasomba_official@hotmail.com</a>.
      </p>

      <p>Cordialement,<br/>L’équipe <strong>Teka Somba</strong></p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 32px;" />
      <p style="font-size: 12px; color: #9ca3af;">Cet e‑mail a été envoyé automatiquement par <a href="https://teka-somba.com" target="_blank" style="color: #9ca3af;">teka-somba.com</a></p>
    </div>
  </div>
  `
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (error instanceof Error && error.message === '403')
      return NextResponse.json(
        { error: 'Accès refusé (admin requis)' },
        { status: 403 }
      );
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
