// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!(payload as any).isAdmin) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  // Seuls les users NON validés et NON rejetés apparaissent
  const users = await prisma.user.findMany({
    where: { isVerified: false, isRejected: false },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      identityCardUrl: true,
    },
  });
  return NextResponse.json(users);
}
