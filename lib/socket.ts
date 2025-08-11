// lib/socket.ts
import { io } from 'socket.io-client';

const SOCKET_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001'
    : undefined;

// instance unique
export const socket = io(SOCKET_URL!, {
  autoConnect: true,
  transports: ['websocket'],
});

export function joinUserRoom(userId: string | null | undefined) {
  if (userId) socket.emit('join_user', userId); // ← on envoie UNE string
}

export function joinConversation(adId: string | null | undefined) {
  if (adId) socket.emit('join_conversation', { adId }); // ← { adId }
}
