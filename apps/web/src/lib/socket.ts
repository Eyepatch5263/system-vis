import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SIMULATION_SERVER_URL || 'http://localhost:3001';
    socket = io(url, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}
