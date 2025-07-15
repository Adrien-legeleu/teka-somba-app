// app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, action } = await req.json();
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  if (!(payload as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (action === 'approve') {
    // Approuver : on marque isVerified = true
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendEmail(
        user.email,
        'Votre compte a été validé',
        'Votre compte est maintenant validé. Vous pouvez vous connecter.'
      );
    }
  } else if (action === 'reject') {
    // Rejeter : on supprime l'utilisateur
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.user.delete({ where: { id: userId } });
      await sendEmail(
        user.email,
        'Votre compte a été refusé',
        "Votre compte a été refusé par l'administrateur. Veuillez vérifier votre pièce d'identité et réessayer."
      );
    }
  }

  return NextResponse.json({ success: true });
}
