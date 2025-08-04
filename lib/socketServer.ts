// lib/socketServer.ts
import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: Server | null = null;

export function initSocket(server: HTTPServer) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: '*', // adapte si besoin
      },
    });

    io.on('connection', (socket) => {
      socket.on('join', (userId: string) => {
        socket.join(userId); // Le user "rejoint sa room"
      });

      socket.on('disconnect', () => {});
    });
  }
  return io;
}

export { io };
