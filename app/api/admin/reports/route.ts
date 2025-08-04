import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin'; // <= AJOUT ICI

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(); // <<== remplace toute la logique d'admin par ça

    // Fetch all reports with associated ad info (title) for context
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ad: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(reports);
  } catch (err) {
    if (err instanceof Error && err.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (err instanceof Error && err.message === '403')
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === '401')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (err instanceof Error && err.message === '403')
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
