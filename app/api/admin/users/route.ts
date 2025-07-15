import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  if (!(payload as any).isAdmin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { isVerified: false, isRejected: false },
    select: { id: true, name: true, email: true, identityCardUrl: true },
  });
  return NextResponse.json(users);
}
