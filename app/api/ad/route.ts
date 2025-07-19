import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildDynamicSchema } from '@/lib/zodDynamic';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');
    const userId = searchParams.get('userId');
    const query = searchParams.get('q')?.trim().toLowerCase();

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

    const where: any = {};
    if (categoryIds.length > 0) where.categoryId = { in: categoryIds };
    if (userId) where.userId = userId;
    if (city) where.location = { contains: city, mode: 'insensitive' };

    const ads = await prisma.ad.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (query) {
      const fuse = new Fuse(ads, {
        keys: [
          'title',
          'description',
          'location',
          'category.name',
          'user.name',
        ],
        threshold: 0.4, // tolérance à l’imprécision
      });
      const result = fuse.search(query).map((r: any) => r.item);
      return NextResponse.json(result);
    }
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 1. Authentification custom
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  let userId: string | undefined;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw new Error('JWT_SECRET manquant dans les variables d’environnement');
    const payload = jwt.verify(token, jwtSecret);
    userId = (payload as JwtPayload & { userId?: string }).userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé dans le token' },
        { status: 401 }
      );
    }
    console.log('✅ UserId extrait du token:', userId);
  } catch (e) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // 2. Parse du body
  let body: any;
  try {
    body = await req.json();
    console.log('✅ Body reçu:', body);
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  // 3. Validation des champs communs
  const baseSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().int().nonnegative(),
    location: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
    images: z.array(z.string().url()).min(1).max(10),
    categoryId: z.string().uuid(),
    dynamicFields: z.object({}).catchall(z.unknown()),
  });

  let parsed;
  try {
    parsed = baseSchema.parse(body);
    console.log('✅ Body validé par Zod:', parsed);
  } catch (err: any) {
    console.log('❌ Erreur validation Zod:', err);
    return NextResponse.json(
      { error: 'Erreur de validation', details: err.errors },
      { status: 400 }
    );
  }

  // 4. Récupère la catégorie et ses champs dynamiques
  const category = await prisma.category.findUnique({
    where: { id: parsed.categoryId },
    include: { fields: true },
  });
  if (!category) {
    return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
  }
  console.log('✅ Catégorie trouvée:', category);

  // 5. Valide les champs dynamiques avec le schéma généré
  const dynamicSchema = buildDynamicSchema(category.fields);
  let dynamicParsed;
  try {
    dynamicParsed = dynamicSchema.parse(parsed.dynamicFields);
    console.log('✅ Champs dynamiques validés:', dynamicParsed);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Erreur de validation des champs dynamiques',
        details: err.errors,
      },
      { status: 400 }
    );
  }

  // 6. Création séquentielle : Ad puis AdField(s)
  try {
    // 1. Crée l'annonce principale
    const newAd = await prisma.ad.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        location: parsed.location,
        lat: parsed.lat,
        lng: parsed.lng,
        images: parsed.images,
        userId: userId,
        categoryId: parsed.categoryId,
      },
    });
    console.log('✅ Annonce créée:', newAd);

    // 2. Ajoute les champs dynamiques un à un
    for (const fieldDef of category.fields) {
      let value = dynamicParsed[fieldDef.name];

      // On skip si pas de valeur (vide, undefined, null)
      if (value === undefined || value === '' || value === null) continue;

      // Cast number proprement si besoin
      if (fieldDef.type === 'number' && typeof value === 'string') {
        value = Number(value);
      }
      console.log(`➡️ Ajout champ dynamique: ${fieldDef.name} =>`, value);

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
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'annonce:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce." },
      { status: 500 }
    );
  }
}
