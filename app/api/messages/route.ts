import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptMessage, decryptMessage } from '@/lib/cryptoMessage';
import { getUserIdFromRequest } from '@/lib/authUser';
// POST : envoyer un message
export async function POST(req: Request) {
  const userId = await getUserIdFromRequest();
  console.log(userId);

  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { adId, receiverId, content } = await req.json();
  console.log(adId, receiverId, content);

  if (receiverId === userId)
    return NextResponse.json(
      { error: 'Impossible de se contacter soi-même.' },
      { status: 400 }
    );

  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad)
    return NextResponse.json(
      { error: 'Annonce introuvable.' },
      { status: 400 }
    );

  // Vérifie que receiverId est soit le vendeur, soit l'acheteur initial
  const isReceiverRelated = ad.userId === receiverId || ad.userId === userId;
  if (!isReceiverRelated)
    return NextResponse.json(
      { error: 'Destinataire invalide pour cette annonce.' },
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

  await prisma.adAnalytics.upsert({
    where: { adId },
    create: { adId, messagesCount: 1 },
    update: { messagesCount: { increment: 1 } },
  });

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
    include: {
      ad: { select: { id: true, title: true, images: true } },
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
    },
  });

  const messagesDecrypted = messages.map((msg) => ({
    ...msg,
    content: decryptMessage(msg.content),
  }));

  return NextResponse.json(messagesDecrypted);
}

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

  // Supprime uniquement côté sender
  await prisma.message.updateMany({
    where: {
      adId,
      senderId: userId,
      receiverId: otherUserId,
    },
    data: {
      deletedBySender: true,
    },
  });

  // Supprime uniquement côté receiver
  await prisma.message.updateMany({
    where: {
      adId,
      senderId: otherUserId,
      receiverId: userId,
    },
    data: {
      deletedByReceiver: true,
    },
  });

  return NextResponse.json({ success: true });
}
