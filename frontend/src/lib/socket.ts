import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io((process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001') + '/ws', {
      transports: ['websocket'],
    });
  }
  return socket;
}

export function joinProject(projectId: string, userId?: string) {
  const socket = getSocket();
  socket.emit('join', { projectId, userId });
}


