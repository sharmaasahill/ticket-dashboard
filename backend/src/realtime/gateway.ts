import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/ws' })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Track connected users by project
  private connectedUsers = new Map<string, Set<string>>(); // projectId -> Set of socketIds
  private userSockets = new Map<string, string>(); // socketId -> userId

  emitTicketUpdated(projectId: string, payload: unknown) {
    this.server.to(`project:${projectId}`).emit('ticket:updated', payload);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { projectId: string; userId?: string }, client: Socket) {
    const room = `project:${data.projectId}`;
    client.join(room);
    
    // Track user connection
    if (data.userId) {
      this.userSockets.set(client.id, data.userId);
      if (!this.connectedUsers.has(data.projectId)) {
        this.connectedUsers.set(data.projectId, new Set());
      }
      this.connectedUsers.get(data.projectId)!.add(data.userId);
    }
    
    return { ok: true, room };
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from tracking
    const userId = this.userSockets.get(client.id);
    if (userId) {
      this.userSockets.delete(client.id);
      
      // Remove from all project rooms
      for (const [projectId, users] of this.connectedUsers.entries()) {
        users.delete(userId);
        if (users.size === 0) {
          this.connectedUsers.delete(projectId);
        }
      }
    }
  }

  getConnectedUsers(projectId: string): string[] {
    const users = this.connectedUsers.get(projectId);
    return users ? Array.from(users) : [];
  }
}


