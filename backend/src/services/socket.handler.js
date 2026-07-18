import { Server } from 'socket.io';
import { registerSocketEvents } from './game/EventRegistry.js';

export const initSocketServer = (server, clientOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Bind to registerSocketEvents module
  registerSocketEvents(io);
};

export default initSocketServer;
