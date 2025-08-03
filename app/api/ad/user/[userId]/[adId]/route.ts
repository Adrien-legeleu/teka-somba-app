import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string; adId: string }> }
) {
  const { userId, adId } = await context.params;

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        category: { select: { id: true, name: true, parentId: true } },
        user: { select: { id: true, name: true, avatar: true } },
        fields: { include: { categoryField: true } },
        adAnalytics: true,
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Annonce non trouvée.' },
        { status: 404 }
      );
    }

    if (ad.user.id !== userId) {
      return NextResponse.json(
        {
          error:
            "Accès interdit. Vous n'êtes pas le propriétaire de cette annonce.",
        },
        { status: 403 }
      );
    }

    const dynamicFields = Object.fromEntries(
      ad.fields.map((f) => [f.categoryField.name, f.value])
    );

    return NextResponse.json({ ...ad, dynamicFields });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération (privée) de l'annonce." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string; adId: string }> }
) {
  const { userId, adId } = await context.params;

  try {
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      return NextResponse.json(
        { error: 'Annonce non trouvée.' },
        { status: 404 }
      );
    }
    if (ad.userId !== userId) {
      return NextResponse.json(
        { error: "Accès interdit. Vous n'êtes pas le propriétaire." },
        { status: 403 }
      );
    }

    const data = await req.json();
    const {
      subCategoryId,
      categoryId, // ← à exclure aussi pour éviter qu'il rentre dans baseData
      dynamicFields,

      ...baseData
    } = data;

    // Mise à jour des données principales
    await prisma.ad.update({
      where: { id: adId },
      data: {
        ...baseData,
        category: { connect: { id: subCategoryId } },
      },
    });

    // Suppression des anciens champs dynamiques
    await prisma.adField.deleteMany({ where: { adId } });

    // Ajout des nouveaux champs dynamiques
    if (dynamicFields && typeof dynamicFields === 'object') {
      const category = await prisma.category.findUnique({
        where: { id: subCategoryId },
        include: { fields: true },
      });

      if (category?.fields?.length) {
        for (const fieldDef of category.fields) {
          const value = dynamicFields[fieldDef.name];
          if (value !== undefined) {
            await prisma.adField.create({
              data: {
                adId,
                categoryFieldId: fieldDef.id,
                value,
              },
            });
          }
        }
      }
    }

    // Récupération de l'annonce mise à jour
    const finalAd = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        category: { select: { id: true, name: true, parentId: true } },
        user: { select: { id: true, name: true, avatar: true } },
        fields: { include: { categoryField: true } },
      },
    });

    const dynamicFieldsOut = Object.fromEntries(
      finalAd?.fields?.map((f) => [f.categoryField.name, f.value]) ?? []
    );

    return NextResponse.json({ ...finalAd, dynamicFields: dynamicFieldsOut });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'annonce." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string; adId: string }> }
) {
  const { userId, adId } = await context.params;

  if (!userId || !adId) {
    return NextResponse.json(
      { error: 'Paramètres manquants' },
      { status: 400 }
    );
  }

  try {
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      return NextResponse.json(
        { error: 'Annonce non trouvée.' },
        { status: 404 }
      );
    }
    if (ad.userId !== userId) {
      return NextResponse.json(
        { error: "Accès interdit. Vous n'êtes pas le propriétaire." },
        { status: 403 }
      );
    }

    await prisma.adField.deleteMany({ where: { adId } });
    await prisma.ad.delete({ where: { id: adId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce." },
      { status: 500 }
    );
  }
}
