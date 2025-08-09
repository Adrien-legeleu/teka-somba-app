// lib/socket.ts
import { io } from 'socket.io-client';

const SOCKET_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001'
    : undefined;

export const socket = io(SOCKET_URL!, {
  autoConnect: true,
  transports: ['websocket'], // garde simple; si souci, enlève pour laisser 'polling' fallback
});

export function joinUserRoom(userId: string | null | undefined) {
  if (userId) socket.emit('join_user', userId);
}

export function joinConversation(adId: string | null | undefined) {
  if (adId) socket.emit('join_conversation', { adId });
}
