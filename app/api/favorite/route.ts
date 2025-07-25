import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ajouter aux favoris
export async function POST(req: Request) {
  const { adId, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await prisma.favorite.create({
      data: { userId, adId },
    });
    await prisma.adAnalytics.upsert({
      where: { adId },
      create: { adId, favoritesCount: 1 },
      update: { favoritesCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Si favori déjà existant (clé unique), ignore
    return NextResponse.json({ error: 'Déjà en favoris' }, { status: 409 });
  }
}

// Retirer des favoris
export async function DELETE(req: Request) {
  const { adId, userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await prisma.favorite.delete({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    });
    await prisma.adAnalytics.update({
      where: { adId },
      data: { favoritesCount: { decrement: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Pas trouvé' }, { status: 404 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  }

  try {
    // Récupère tous les favoris de cet user
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            location: true,
            category: { select: { id: true, name: true } },
            favorites: false,
          },
        },
      },
    });

    const ads = favorites
      .map((fav) => fav.ad)
      .filter(Boolean)
      .map((ad) => ({
        ...ad,
        isFavorite: true,
      }));

    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
