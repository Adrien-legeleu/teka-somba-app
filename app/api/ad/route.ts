import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (city) where.city = city;
    if (userId) where.userId = userId;

    const ads = await prisma.ad.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      userId,
      images,
      categoryId,
      city,
      location,
      latitude,
      longitude,
    } = body;

    if (
      !title ||
      !description ||
      !price ||
      !userId ||
      !categoryId ||
      !city ||
      !images
    ) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires ne sont pas remplis.' },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé.' },
        { status: 404 }
      );
    }
    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        price,
        images: images ?? [],
        userId,
        categoryId,
        city,
        location,
        latitude,
        longitude,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce." },
      { status: 500 }
    );
  }
}
