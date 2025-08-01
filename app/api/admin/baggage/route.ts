// app/api/admin/baggage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET(req: NextRequest) {
  // Verify requesting user is an admin
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const adminUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!adminUser || !adminUser.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Fetch all baggage requests, newest first
  const requests = await prisma.baggageRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(requests);
}

export async function DELETE(req: NextRequest) {
  // Only admins can delete baggage requests
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
    await prisma.baggageRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
