// /app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      fields: true, // 🔹 pour les catégories principales (si jamais tu en ajoutes)
      children: {
        include: {
          fields: true, // 🔹 pour les sous-catégories comme 'voitures'
        },
      },
    },
  });

  return NextResponse.json(categories);
}
