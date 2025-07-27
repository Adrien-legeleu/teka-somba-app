import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildDynamicSchema } from '@/lib/zodDynamic';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Fuse from 'fuse.js';

type AuthPayload = JwtPayload & { userId?: string };

interface AdWithRelations {
  id: string;
  title: string;
  description: string;
  price: number;
  location?: string;
  images: string[];
  isDon?: boolean;
  createdAt: Date;
  category: { id: string; name: string };
  user: { id: string; name: string; avatar: string | null };
  favorites?: { id: string }[];
  isFavorite?: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');
    const userId = searchParams.get('userId');
    const query = searchParams.get('q')?.trim().toLowerCase() || '';
    const isDon = searchParams.get('isDon') === 'true';

    // ----- Nouveaux paramètres -----
    const priceMinRaw = searchParams.get('priceMin');
    const priceMaxRaw = searchParams.get('priceMax');

    const sortByRaw = searchParams.get('sortBy');
    const sortByParam: 'price' | 'createdAt' =
      sortByRaw === 'price' ? 'price' : 'createdAt';

    const sortOrderRaw = searchParams.get('sortOrder');
    const sortOrderParam: 'asc' | 'desc' =
      sortOrderRaw === 'asc' ? 'asc' : 'desc';

    const priceMin =
      priceMinRaw !== null && !Number.isNaN(Number(priceMinRaw))
        ? Number(priceMinRaw)
        : undefined;
    const priceMax =
      priceMaxRaw !== null && !Number.isNaN(Number(priceMaxRaw))
        ? Number(priceMaxRaw)
        : undefined;

    // ----- Catégorie + sous-catégories -----
    let categoryIds: string[] = [];
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: true },
      });
      categoryIds = [
        categoryId,
        ...(category?.children.map((c) => c.id) || []),
      ];
    }

    // ----- WHERE -----
    const where: Prisma.AdWhereInput = {};
    if (categoryIds.length > 0) where.categoryId = { in: categoryIds };
    if (isDon) where.isDon = true;
    if (city) where.location = { contains: city, mode: 'insensitive' };

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined)
        (where.price as Prisma.IntFilter).gte = priceMin;
      if (priceMax !== undefined)
        (where.price as Prisma.IntFilter).lte = priceMax;
    }

    // ----- TRI DB -----
    const orderBy: Prisma.AdOrderByWithRelationInput =
      sortByParam === 'price'
        ? { price: sortOrderParam }
        : { createdAt: sortOrderParam };

    // ----- Récupération -----
    const ads = (await prisma.ad.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true } },
        favorites: userId ? { where: { userId } } : false,
      },
      orderBy,
    })) as AdWithRelations[];

    const adsWithFavorite = ads.map((ad) => ({
      ...ad,
      isFavorite: userId ? (ad.favorites?.length ?? 0) > 0 : false,
    }));

    // ----- Recherche fuzzy (après DB) -----
    let result = adsWithFavorite;
    if (query) {
      const fuse = new Fuse(adsWithFavorite, {
        keys: [
          'title',
          'description',
          'location',
          'category.name',
          'user.name',
        ],
        threshold: 0.4,
      });
      result = fuse.search(query).map((r) => r.item);

      // Conserver le tri demandé même après fuzzy
      result.sort((a, b) => {
        const dir = sortOrderParam === 'asc' ? 1 : -1;
        if (sortByParam === 'price') {
          return (a.price - b.price) * dir;
        }
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  let userId: string | undefined;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET manquant');
    const payload = jwt.verify(token, jwtSecret) as AuthPayload;
    userId = payload.userId;
    if (!userId)
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const baseSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().int().nonnegative(),
    location: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
    isDon: z.boolean().optional(),
    images: z.array(z.string().url()).min(1).max(10),
    categoryId: z.string().uuid(),
    dynamicFields: z.record(z.string(), z.unknown()), // Fixe le problème de .record
  });

  let parsed: z.infer<typeof baseSchema>;
  try {
    parsed = baseSchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      { error: 'Erreur de validation', details: (err as z.ZodError).issues },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.categoryId },
    include: { fields: true },
  });
  if (!category)
    return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });

  const dynamicSchema = buildDynamicSchema(category.fields);
  let dynamicParsed: Record<string, unknown>;
  try {
    dynamicParsed = dynamicSchema.parse(parsed.dynamicFields);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Erreur validation des champs dynamiques',
        details: (err as z.ZodError).issues,
      },
      { status: 400 }
    );
  }

  try {
    const newAd = await prisma.ad.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        location: parsed.location,
        lat: parsed.lat,
        lng: parsed.lng,
        images: parsed.images,
        isDon: parsed.isDon ?? false,
        userId,
        categoryId: parsed.categoryId,
      },
    });

    for (const fieldDef of category.fields) {
      let value = dynamicParsed[fieldDef.name];
      if (value === undefined || value === '' || value === null) continue;
      if (fieldDef.type === 'number' && typeof value === 'string')
        value = Number(value);

      await prisma.adField.create({
        data: {
          adId: newAd.id,
          categoryFieldId: fieldDef.id,
          value: value as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json(
      { success: true, adId: newAd.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce." },
      { status: 500 }
    );
  }
}
