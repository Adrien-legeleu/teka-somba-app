import { io } from 'socket.io-client';

const SOCKET_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:4001'
    : undefined;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;
