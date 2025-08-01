import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) return NextResponse.json({ unread: false });

  const count = await prisma.message.count({
    where: { receiverId: userId, isRead: false },
  });

  return NextResponse.json({ unread: count > 0 });
}
