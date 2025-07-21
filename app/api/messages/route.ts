import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptMessage, decryptMessage } from '@/lib/cryptoMessage';
import { getUserIdFromRequest } from '@/lib/authUser';

// POST : envoyer un message
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { adId, receiverId, content } = await req.json();
  if (receiverId === userId)
    return NextResponse.json(
      { error: 'Impossible de se contacter soi-même.' },
      { status: 400 }
    );

  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad || ad.userId !== receiverId)
    return NextResponse.json(
      { error: 'Annonce ou destinataire invalide.' },
      { status: 400 }
    );

  const encryptedContent = encryptMessage(content);

  const message = await prisma.message.create({
    data: {
      adId,
      senderId: userId,
      receiverId,
      content: encryptedContent,
    },
  });

  // TODO: ici tu pourras brancher la notif websocket (à venir)

  return NextResponse.json({ ...message, content }, { status: 201 });
}

// GET : messages d'une conversation (adId, otherUserId)
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const adId = searchParams.get('adId');
  const otherUserId = searchParams.get('otherUserId');
  if (!adId || !otherUserId)
    return NextResponse.json(
      { error: 'Paramètres manquants' },
      { status: 400 }
    );

  // Affiche tous les messages pas "supprimés" pour ce user
  const messages = await prisma.message.findMany({
    where: {
      adId,
      OR: [
        { senderId: userId, receiverId: otherUserId, deletedBySender: false },
        { senderId: otherUserId, receiverId: userId, deletedByReceiver: false },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  const messagesDecrypted = messages.map((msg) => ({
    ...msg,
    content: decryptMessage(msg.content),
  }));

  return NextResponse.json(messagesDecrypted);
}

// DELETE : supprimer une conversation (soft-delete pour ce user)
export async function DELETE(req: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { adId, otherUserId } = await req.json();
  if (!adId || !otherUserId)
    return NextResponse.json(
      { error: 'Paramètres manquants' },
      { status: 400 }
    );

  // Soft-delete pour CE user uniquement
  await prisma.message.updateMany({
    where: {
      adId,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    data: {
      deletedBySender: true,
      deletedByReceiver: true,
    },
  });

  return NextResponse.json({ success: true });
}
