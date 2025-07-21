import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { adId: string } }
) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: params.adId },
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
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'annonce." },
      { status: 500 }
    );
  }
}
