import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildDynamicSchema } from '@/lib/zodDynamic';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
  lat?: number | null;
  lng?: number | null;
}

interface AdListItem {
  id: string;
  title: string;
  price: number;
  location: string | null;
  images: string[] | null;
  isFavorite: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination bornée
    const page = clampInt(searchParams.get('page'), 1, 1_000_000, 1);
    const limit = clampInt(searchParams.get('limit'), 1, 50, 20);
    const skip = (page - 1) * limit;

    // Filtres
    const categoryId = strOrNull(searchParams.get('categoryId'));
    const city = strOrNull(searchParams.get('city'));
    const q = (searchParams.get('q') || '').trim();
    const isDon = searchParams.get('isDon') === 'true';
    const sortBy: 'price' | 'createdAt' =
      searchParams.get('sortBy') === 'price' ? 'price' : 'createdAt';
    const sortOrder: 'asc' | 'desc' =
      searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const priceMin = numOrNull(searchParams.get('priceMin'));
    const priceMax = numOrNull(searchParams.get('priceMax'));
    const lat = numOrNull(searchParams.get('lat'));
    const lng = numOrNull(searchParams.get('lng'));
    const radiusKm = numOrNull(searchParams.get('radius'));

    // userId pour favoris
    let favoritesUserId: string | null = null;
    try {
      const token = req.cookies.get('token')?.value;
      if (token) {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as AuthPayload;
        favoritesUserId = payload.userId ?? null;
      }
    } catch {
      // Token invalide => pas de favoris
    }
    if (!favoritesUserId) {
      favoritesUserId = strOrNull(searchParams.get('userId'));
    }

    // Catégorie + enfants
    let categoryIds: string[] | undefined;
    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: { select: { id: true } } },
      });
      if (cat) categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
    }

    // ==================== BRANCHE GÉOLOC ====================
    if (lat != null && lng != null && radiusKm != null) {
      const R = 6371;
      const dLat = (radiusKm / R) * (180 / Math.PI);
      const dLng = dLat / Math.cos((lat * Math.PI) / 180);
      const minLat = lat - dLat;
      const maxLat = lat + dLat;
      const minLng = lng - dLng;
      const maxLng = lng + dLng;

      const clauses: Prisma.Sql[] = [
        Prisma.sql`"Ad"."lat" IS NOT NULL AND "Ad"."lng" IS NOT NULL`,
        Prisma.sql`"Ad"."lat" BETWEEN ${minLat} AND ${maxLat}`,
        Prisma.sql`"Ad"."lng" BETWEEN ${minLng} AND ${maxLng}`,
      ];
      if (categoryIds?.length)
        clauses.push(
          Prisma.sql`"Ad"."categoryId" IN (${Prisma.join(categoryIds)})`
        );
      if (isDon) clauses.push(Prisma.sql`"Ad"."isDon" = true`);
      if (city)
        clauses.push(
          Prisma.sql`LOWER("Ad"."location") LIKE ${'%' + city.toLowerCase() + '%'}`
        );
      if (priceMin != null)
        clauses.push(Prisma.sql`"Ad"."price" >= ${priceMin}`);
      if (priceMax != null)
        clauses.push(Prisma.sql`"Ad"."price" <= ${priceMax}`);
      if (q) {
        const like = '%' + q.toLowerCase() + '%';
        clauses.push(
          Prisma.sql`(LOWER("Ad"."title") LIKE ${like} OR LOWER("Ad"."description") LIKE ${like} OR LOWER("Ad"."location") LIKE ${like})`
        );
      }

      const WHERE = clauses.length
        ? Prisma.sql`WHERE ${Prisma.join(clauses, ' AND ')}`
        : Prisma.empty;
      const distanceSQL = Prisma.sql`(
        6371 * ACOS(
          COS(RADIANS(${lat})) * COS(RADIANS("Ad"."lat")) *
          COS(RADIANS("Ad"."lng") - RADIANS(${lng})) +
          SIN(RADIANS(${lat})) * SIN(RADIANS("Ad"."lat"))
        )
      )`;

      const ORDER =
        sortBy === 'price'
          ? Prisma.sql`ORDER BY "Ad"."price" ${Prisma.raw(sortOrder.toUpperCase())}`
          : Prisma.sql`ORDER BY "Ad"."createdAt" ${Prisma.raw(sortOrder.toUpperCase())}`;

      const countRows = await prisma.$queryRaw<{ count: bigint }[]>(
        Prisma.sql`SELECT COUNT(*)::bigint AS count FROM "Ad" ${WHERE} AND ${distanceSQL} <= ${radiusKm}`
      );
      const total = Number(countRows[0]?.count ?? 0);

      const rows = await prisma.$queryRaw<AdListItem[]>(
        Prisma.sql`
          SELECT
            "Ad"."id",
            "Ad"."title",
            "Ad"."price",
            "Ad"."location",
            "Ad"."images",
            ${
              favoritesUserId
                ? Prisma.sql`EXISTS(SELECT 1 FROM "Favorite" f WHERE f."adId" = "Ad"."id" AND f."userId" = ${favoritesUserId})`
                : Prisma.sql`false`
            } AS "isFavorite"
          FROM "Ad"
          ${WHERE}
          AND ${distanceSQL} <= ${radiusKm}
          ${ORDER}
          LIMIT ${limit} OFFSET ${skip}
        `
      );

      const data = rows.map((r) => ({
        id: r.id,
        title: r.title,
        price: Number(r.price),
        location: r.location,
        images: Array.isArray(r.images)
          ? (r.images as string[]).slice(0, 1)
          : [],
        isFavorite: r.isFavorite,
      }));

      return NextResponse.json(
        { data, total },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    // ==================== BRANCHE PRISMA (sans géoloc) ====================
    const where: Prisma.AdWhereInput = {};
    if (categoryIds?.length) where.categoryId = { in: categoryIds };
    if (isDon) where.isDon = true;
    if (city) where.location = { contains: city, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (priceMin != null || priceMax != null) {
      where.price = {};
      if (priceMin != null) where.price.gte = priceMin;
      if (priceMax != null) where.price.lte = priceMax;
    }

    const [total, list] = await Promise.all([
      prisma.ad.count({ where }),
      prisma.ad.findMany({
        where,
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          images: true,
          favorites: favoritesUserId
            ? { where: { userId: favoritesUserId }, select: { id: true } }
            : false,
        },
        orderBy:
          sortBy === 'price' ? { price: sortOrder } : { createdAt: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const data = list.map((ad) => ({
      id: ad.id,
      title: ad.title,
      price: ad.price,
      location: ad.location ?? null,
      images: Array.isArray(ad.images)
        ? (ad.images as string[]).slice(0, 1)
        : [],
      isFavorite: favoritesUserId
        ? (ad.favorites as { id: string }[]).length > 0
        : false,
    }));

    const cacheHeaders = favoritesUserId
      ? { 'Cache-Control': 'private, no-store' }
      : { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' };

    return NextResponse.json({ data, total }, { headers: cacheHeaders });
  } catch (e) {
    console.error('GET /api/ad error', e);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    );
  }
}

/* Helpers */
function clampInt(
  raw: string | null,
  min: number,
  max: number,
  fallback: number
) {
  const n = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function numOrNull(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function strOrNull(raw: string | null): string | null {
  const v = raw?.trim();
  return v || null;
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
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),

    isDon: z.boolean().optional(),
    images: z.array(z.string().url()).min(1).max(10),
    categoryId: z.string(),
    dynamicFields: z.record(z.string(), z.unknown()),
    type: z.enum(['FOR_SALE', 'FOR_RENT']),
    durationValue: z.number().optional(),
    durationUnit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']).optional(),
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
    const adData = {
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
      type: parsed.type,
      durationValue: parsed.durationValue,
      durationUnit: parsed.durationUnit,
    };

    // 1️⃣ Prépare le bulk d’AdField
    const adFieldsData = category.fields
      .map((fieldDef) => {
        const value = dynamicParsed[fieldDef.name];
        if (value === undefined || value === '' || value === null) return null;
        return {
          categoryFieldId: fieldDef.id,
          value: value as Prisma.InputJsonValue, // déjà typé par zodDynamic
        };
      })
      .filter(Boolean) as {
      categoryFieldId: string;
      value: Prisma.InputJsonValue;
    }[];

    // 2️⃣ Transaction : crée tout ou rien
    const [newAd] = await prisma
      .$transaction([
        prisma.ad.create({
          data: adData,
        }),
        // ATTENTION : adFields ont besoin de l'id du nouvel ad => petit trick :
        // on doit d'abord créer l'ad, puis faire createMany avec son id
      ])
      .then(async ([ad]) => {
        if (adFieldsData.length) {
          await prisma.adField.createMany({
            data: adFieldsData.map((f) => ({
              ...f,
              adId: ad.id,
            })),
          });
        }
        return [ad];
      });

    return NextResponse.json(
      { success: true, adId: newAd.id },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce." },
      { status: 500 }
    );
  }
}
