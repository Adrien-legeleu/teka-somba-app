import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET : Voir UNE annonce (private pour owner)
export async function GET(
  request: Request,
  { params }: { params: { userId: string; adId: string } }
) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: params.adId },
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
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
    return NextResponse.json(ad);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération (privée) de l'annonce." },
      { status: 500 }
    );
  }
}

// PATCH : Modifier une annonce (propriétaire uniquement)
export async function PATCH(
  request: Request,
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

    const data = await request.json();
    // Empêche de changer userId, id
    delete data.id;
    delete data.userId;

    const updatedAd = await prisma.ad.update({
      where: { id: params.adId },
      data,
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
    return NextResponse.json(updatedAd);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'annonce." },
      { status: 500 }
    );
  }
}

// DELETE : Supprimer une annonce (propriétaire uniquement)
export async function DELETE(
  request: Request,
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

    await prisma.ad.delete({ where: { id: params.adId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce." },
      { status: 500 }
    );
  }
}
