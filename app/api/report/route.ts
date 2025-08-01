import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { adId, reason, message } = await req.json();

  if (!adId || !reason) {
    return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      adId,
      reason,
      message,
    },
  });

  return NextResponse.json({ success: true, report });
}
