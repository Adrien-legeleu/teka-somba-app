import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');
    const isDon = searchParams.get('isDon') === 'true';

    // Type Prisma pour le filtre
    const filters: Prisma.AdWhereInput = {
      userId,
    };

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (city) {
      filters.location = { contains: city, mode: 'insensitive' };
    }

    if (q) {
      filters.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (isDon) {
      filters.isDon = true;
    }

    const ads = await prisma.ad.findMany({
      where: filters,
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
