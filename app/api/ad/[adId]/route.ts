import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Ctx = {
  params: Promise<{ adId: string }>;
};

export async function GET(request: Request, { params }: Ctx) {
  const { adId } = await params; // on attend la Promise

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, prenom: true, avatar: true } },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Annonce non trouvée.' },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'annonce." },
      { status: 500 }
    );
  }
}
