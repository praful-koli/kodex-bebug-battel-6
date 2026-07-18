import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

// Single production-grade socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export default socket;
