// app/api/admin/demote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function POST(req: NextRequest) {
  const adminId = await getUserIdFromRequest(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser || !adminUser.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Action réservée au super admin' },
      { status: 403 }
    );
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 404 }
    );
  }
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: 'Cet utilisateur n’est pas admin' },
      { status: 400 }
    );
  }
  if (user.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Impossible de retirer un super admin' },
      { status: 403 }
    );
  }
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la révocation' },
      { status: 500 }
    );
  }
}
