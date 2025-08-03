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
  lat?: number | null;
  lng?: number | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // --- Filtres principaux
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');
    const userId = searchParams.get('userId'); // Pour les favoris
    const query = searchParams.get('q')?.trim().toLowerCase() || '';
    const isDon = searchParams.get('isDon') === 'true';

    // --- Filtres prix / tri
    const priceMinRaw = searchParams.get('priceMin');
    const priceMaxRaw = searchParams.get('priceMax');
    const sortByRaw = searchParams.get('sortBy');
    const sortByParam: 'price' | 'createdAt' =
      sortByRaw === 'price' ? 'price' : 'createdAt';
    const sortOrderRaw = searchParams.get('sortOrder');
    const sortOrderParam: 'asc' | 'desc' =
      sortOrderRaw === 'asc' ? 'asc' : 'desc';

    // --- Filtre géolocalisation
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const radiusKm = radius ? parseFloat(radius) : null;

    // --- Calcul bornes prix
    const priceMin =
      priceMinRaw !== null && !Number.isNaN(Number(priceMinRaw))
        ? Number(priceMinRaw)
        : undefined;
    const priceMax =
      priceMaxRaw !== null && !Number.isNaN(Number(priceMaxRaw))
        ? Number(priceMaxRaw)
        : undefined;

    // --- Catégorie + sous-catégories
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

    // ------------------------------------
    // ---- 1/ REQUÊTE SQL RAW SI GEO -----
    // ------------------------------------
    let ads: AdWithRelations[] = [];
    if (userLat !== null && userLng !== null && radiusKm !== null) {
      // Construit le WHERE dynamique
      let sqlWhere = `
        WHERE "Ad".lat IS NOT NULL
          AND "Ad".lng IS NOT NULL
          AND (
            6371 * acos(
              cos(radians($1)) * cos(radians("Ad".lat)) *
              cos(radians("Ad".lng) - radians($2)) +
              sin(radians($1)) * sin(radians("Ad".lat))
            )
          ) <= $3
      `;
      const sqlParams: (number | string)[] = [userLat, userLng, radiusKm];

      // Ajoute autres filtres dynamiquement
      let paramIndex = 4;
      if (categoryIds.length > 0) {
        sqlWhere += ` AND "Ad"."categoryId" IN (${categoryIds
          .map((_, i) => `$${paramIndex++}`)
          .join(',')})`;
        sqlParams.push(...categoryIds);
      }
      if (isDon) {
        sqlWhere += ` AND "Ad"."isDon" = true`;
      }
      if (city) {
        sqlWhere += ` AND LOWER("Ad"."location") LIKE $${paramIndex}`;
        sqlParams.push(`%${city.toLowerCase()}%`);
        paramIndex++;
      }
      if (priceMin !== undefined) {
        sqlWhere += ` AND "Ad"."price" >= $${paramIndex}`;
        sqlParams.push(priceMin);
        paramIndex++;
      }
      if (priceMax !== undefined) {
        sqlWhere += ` AND "Ad"."price" <= $${paramIndex}`;
        sqlParams.push(priceMax);
        paramIndex++;
      }

      // Tri
      let sqlOrder = `ORDER BY "Ad"."${sortByParam}" ${sortOrderParam.toUpperCase()}`;

      // -- Final query --
      ads = await prisma.$queryRawUnsafe<AdWithRelations[]>(
        `
        SELECT
          "Ad".*,
          "User".name as "userName",
          "User".avatar as "userAvatar",
          "Category".name as "categoryName"
        FROM "Ad"
        LEFT JOIN "User" ON "Ad"."userId" = "User".id
        LEFT JOIN "Category" ON "Ad"."categoryId" = "Category".id
        ${sqlWhere}
        ${sqlOrder}
        `,
        ...sqlParams
      );
    } else {
      // ------------------------------------
      // --------- 2/ PRISMA NORMAL ---------
      // ------------------------------------
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

      ads = (await prisma.ad.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true } },
          favorites: userId ? { where: { userId } } : false,
        },
        orderBy:
          sortByParam === 'price'
            ? { price: sortOrderParam }
            : { createdAt: sortOrderParam },
      })) as any; // mapping juste après
    }

    // ---- 3/ Mapping et favoris -----
    let adsWithFavorite = ads.map((ad: any) => ({
      ...ad,
      isFavorite: userId
        ? !!(ad.favorites ? (ad.favorites?.length ?? 0) > 0 : ad.isFavorite) // si jointure SQL
        : false,
    }));

    // ---- 4/ Recherche fuzzy (après DB, si query) -----
    let result = adsWithFavorite;
    if (query) {
      const fuse = new Fuse(adsWithFavorite, {
        keys: ['title', 'description', 'location', 'categoryName', 'userName'],
        threshold: 0.4,
      });
      result = fuse.search(query).map((r) => r.item);

      // Trie le résultat même après fuzzy
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
    console.log('📥 Payload reçu côté serveur :', body);
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
    categoryId: z.string(),
    dynamicFields: z.record(z.string(), z.unknown()),
    type: z.enum(['FOR_SALE', 'FOR_RENT']),
    durationValue: z.number().optional(),
    durationUnit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).optional(),
  });

  let parsed: z.infer<typeof baseSchema>;

  try {
    parsed = baseSchema.parse(body);
    console.log('✅ Données validées (base) :', parsed);
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
  console.log(
    '⛔ Champs dynamiques reçus côté serveur :',
    parsed.dynamicFields
  );
  console.log('🧩 Schéma attendu :', category.fields);

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
        type: parsed.type,
        durationValue: parsed.durationValue,
        durationUnit: parsed.durationUnit,
      },
    });

    for (const fieldDef of category.fields) {
      let value = dynamicParsed[fieldDef.name];
      if (value === undefined || value === '' || value === null) continue;
      if (fieldDef.type === 'number' && typeof value === 'string')
        value = Number(value);
      console.log('📌 Champs dynamiques parsés :', dynamicParsed);

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
