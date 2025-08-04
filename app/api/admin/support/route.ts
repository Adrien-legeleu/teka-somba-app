import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET() {
  try {
    await requireAdmin(); // <-- Centralise la vérif admin ici

    const requests = await prisma.helpRequest.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        createdAt: true,
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    if (error instanceof Error && error.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (error instanceof Error && error.message === '403')
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    await prisma.helpRequest.update({
      where: { id },
      data: { resolved: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (error instanceof Error && error.message === '403')
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
