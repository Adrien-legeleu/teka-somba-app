import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      fields: true,
      children: {
        include: {
          fields: true,
          children: {
            // Si tu veux plusieurs niveaux
            include: { fields: true },
          },
        },
      },
    },
  });

  return NextResponse.json(categories);
}
