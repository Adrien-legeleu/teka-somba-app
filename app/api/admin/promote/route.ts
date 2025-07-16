// app/api/admin/promote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email'; // ajoute ceci

export async function POST(req: NextRequest) {
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
    'Félicitations, vous êtes maintenant admin !',
    `Bonjour ${user.name || ''},<br>
    Votre compte vient d'être promu administrateur sur la plateforme.<br>
    Vous pouvez maintenant accéder à l'espace d'administration.<br>
    <a href="https://ton-site.com/admin">Accéder à l’admin</a>`
  );

  return NextResponse.json({
    success: true,
    message: `${email} est maintenant admin.`,
  });
}
