import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';
import { AppGateway } from '../realtime/gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly gateway: AppGateway,
  ) {}

  async notifyProjectMembersIfOffline(projectId: string, message: string) {
    try {
      // Get all members of the project
      const members = await this.prisma.membership.findMany({
        where: { projectId },
        include: { user: true },
      });

      if (members.length === 0) {
        console.log(`No members found for project ${projectId}`);
        return;
      }

      // Get currently connected users in this project
      const connectedUsers = this.getConnectedUsers(projectId);
      console.log(`Connected users in project ${projectId}:`, connectedUsers);

      // Find offline members (those not currently connected)
      const offlineMembers = members.filter(member => 
        !connectedUsers.includes(member.userId)
      );

      console.log(`Offline members to notify: ${offlineMembers.length}`);

      // Send email notifications to offline members
      if (offlineMembers.length > 0) {
        await Promise.all(
          offlineMembers.map(member => 
            this.sendOfflineNotification(member.user.email, message)
          )
        );
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  }

  private getConnectedUsers(projectId: string): string[] {
    // Get all sockets in the project room
    const room = `project:${projectId}`;
    const sockets = this.gateway.server.sockets.adapter.rooms.get(room);
    
    if (!sockets) {
      return [];
    }

    // For now, we'll return empty array since we don't have user ID tracking
    // In a real implementation, you'd store user IDs when they connect
    // and map socket IDs to user IDs
    return [];
  }

  private async sendOfflineNotification(email: string, message: string): Promise<void> {
    try {
      // Create a proper email notification (not OTP)
      await this.mail.sendNotification(email, message);
      console.log(`Offline notification sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send offline notification to ${email}:`, error);
    }
  }
}

