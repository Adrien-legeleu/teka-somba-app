import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    // ✅ On récupère tous les users qui sont admins, peu importe leur état
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        identityCardUrl: true,
      },
      orderBy: { email: 'asc' },
    });

    return NextResponse.json(admins);
  } catch (error) {
    if (error instanceof Error && error.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (error instanceof Error && error.message === '403')
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
