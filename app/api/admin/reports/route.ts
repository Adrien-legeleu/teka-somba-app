// app/api/admin/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const adminUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!adminUser || !adminUser.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Fetch all reports with associated ad info (title) for context
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ad: { select: { id: true, title: true } },
    },
  });
  return NextResponse.json(reports);
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const adminUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!adminUser || !adminUser.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }
  try {
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
