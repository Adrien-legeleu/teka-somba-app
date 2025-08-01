import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isAdmin)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

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
    console.error('Erreur GET support admin :', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isAdmin)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    await prisma.helpRequest.update({
      where: { id },
      data: { resolved: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PATCH support admin :', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
