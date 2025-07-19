import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');

    // Construction dynamique du filtre
    const filters: any = { userId: params.userId };

    if (categoryId) filters.categoryId = categoryId;
    if (city) filters.location = { contains: city, mode: 'insensitive' };
    if (q) {
      filters.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        // Tu peux ajouter d'autres champs ici
      ];
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
