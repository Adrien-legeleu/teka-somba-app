import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId) return NextResponse.json(null, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      prenom: true,
      email: true,
      avatar: true,
      city: true,
      age: true,
      isAdmin: true,
      isSuperAdmin: true,
    },
  });

  return NextResponse.json(user);
}
