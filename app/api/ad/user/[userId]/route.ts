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

    // nouveaux
    const priceMinRaw = searchParams.get('priceMin');
    const priceMaxRaw = searchParams.get('priceMax');
    const sortBy =
      (searchParams.get('sortBy') as 'price' | 'createdAt' | null) ??
      'createdAt';
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc';

    const priceMin = priceMinRaw ? Number(priceMinRaw) : undefined;
    const priceMax = priceMaxRaw ? Number(priceMaxRaw) : undefined;

    const where: Prisma.AdWhereInput = { userId };

    if (categoryId) where.categoryId = categoryId;
    if (city) where.location = { contains: city, mode: 'insensitive' };
    if (isDon) where.isDon = true;

    if (typeof priceMin === 'number' && !Number.isNaN(priceMin)) {
      where.price = { ...(where.price as object), gte: priceMin };
    }
    if (typeof priceMax === 'number' && !Number.isNaN(priceMax)) {
      where.price = { ...(where.price as object), lte: priceMax };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.AdOrderByWithRelationInput =
      sortBy === 'price' ? { price: sortOrder } : { createdAt: sortOrder };

    const ads = await prisma.ad.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy,
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
