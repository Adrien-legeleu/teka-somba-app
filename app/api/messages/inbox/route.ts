import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptMessage } from '@/lib/cryptoMessage';
import { getUserIdFromRequest } from '@/lib/authUser';

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, deletedBySender: false },
        { receiverId: userId, deletedByReceiver: false },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      ad: true,
      sender: { select: { id: true, name: true, prenom: true, avatar: true } },
      receiver: {
        select: { id: true, name: true, prenom: true, avatar: true },
      },
    },
  });

  // Regroupe par annonce + autre user
  const threadsMap = new Map();
  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const key = `${msg.adId}:${otherId}`;
    if (!threadsMap.has(key)) {
      threadsMap.set(key, {
        ad: msg.ad,
        otherUser: msg.senderId === userId ? msg.receiver : msg.sender,
        lastMessage: {
          ...msg,
          content: decryptMessage(msg.content),
        },
      });
    }
  }

  const threads = Array.from(threadsMap.values());
  return NextResponse.json(threads);
}
