import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/ws' })
export class AppGateway {
  @WebSocketServer()
  server!: Server;

  emitTicketUpdated(projectId: string, payload: unknown) {
    this.server.to(`project:${projectId}`).emit('ticket:updated', payload);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { projectId: string }) {
    // This is simple room join without auth for demo purposes.
    const room = `project:${data.projectId}`;
    this.server.socketsJoin(room);
    return { ok: true, room };
  }
}


