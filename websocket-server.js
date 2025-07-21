// websocket-server.js
const { Server } = require('socket.io');

const io = new Server(process.env.PORT || 4001, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  // Rejoindre une room d’annonce
  socket.on('join_conversation', ({ adId, userId }) => {
    socket.join(`ad-${adId}`);
  });

  // Relayer un message à tous dans la même annonce
  socket.on('send_message', (message) => {
    io.to(`ad-${message.adId}`).emit('new_message', message);
  });
});

console.log(
  'WebSocket server running on ws://localhost:' + (process.env.PORT || 4001)
);
