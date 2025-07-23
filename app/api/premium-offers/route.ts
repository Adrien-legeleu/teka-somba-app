import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const offers = await prisma.premiumOffer.findMany({
    orderBy: { price: 'asc' },
  });
  return NextResponse.json(offers);
}
