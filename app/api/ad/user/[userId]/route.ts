import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const ads = await prisma.ad.findMany({
      where: { userId: params.userId },
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des annonces de l'utilisateur.",
      },
      { status: 500 }
    );
  }
}
