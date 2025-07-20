import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; adId: string } }
) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: params.adId },
      include: {
        category: { select: { id: true, name: true, parentId: true } },
        user: { select: { id: true, name: true, avatar: true } },
        fields: {
          include: {
            categoryField: true,
          },
        },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Annonce non trouvée.' },
        { status: 404 }
      );
    }

    if (ad.user.id !== params.userId) {
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
  { params }: { params: { userId: string; adId: string } }
) {
  try {
    const ad = await prisma.ad.findUnique({ where: { id: params.adId } });
    if (!ad) {
      return NextResponse.json(
        { error: 'Annonce non trouvée.' },
        { status: 404 }
      );
    }
    if (ad.userId !== params.userId) {
      return NextResponse.json(
        { error: "Accès interdit. Vous n'êtes pas le propriétaire." },
        { status: 403 }
      );
    }

    const data = await req.json();

    // 1. On extrait les infos nécessaires
    const { categoryId, dynamicFields, ...baseData } = data;

    // 2. Met à jour l'annonce (hors champs dynamiques)
    const updatedAd = await prisma.ad.update({
      where: { id: params.adId },
      data: {
        ...baseData,
        category: {
          connect: { id: categoryId },
        },
      },
    });

    // 3. Supprime les anciens champs dynamiques
    await prisma.adField.deleteMany({ where: { adId: params.adId } });

    // 4. Ajoute les nouveaux champs dynamiques
    if (dynamicFields && typeof dynamicFields === 'object') {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { fields: true },
      });

      // On fait correspondre les noms (clé/valeur) aux CategoryField existants
      if (category?.fields?.length) {
        for (const fieldDef of category.fields) {
          const value = dynamicFields[fieldDef.name];
          if (value !== undefined) {
            await prisma.adField.create({
              data: {
                adId: params.adId,
                categoryFieldId: fieldDef.id,
                value,
              },
            });
          }
        }
      }
    }

    // 5. Recharge l’annonce complète avec la catégorie, user, et les champs dynamiques
    const finalAd = await prisma.ad.findUnique({
      where: { id: params.adId },
      include: {
        category: { select: { id: true, name: true, parentId: true } },
        user: { select: { id: true, name: true, avatar: true } },
        fields: {
          include: {
            categoryField: true,
          },
        },
      },
    });

    // 6. On retransforme pour le front
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
  context: { params?: { userId?: string; adId?: string } }
) {
  const userId = context.params?.userId;
  const adId = context.params?.adId;

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
