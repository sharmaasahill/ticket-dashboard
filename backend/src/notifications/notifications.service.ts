import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async notifyProjectMembersIfOffline(projectId: string, message: string) {
    try {
      // Get all members of the project
      const members = await this.prisma.membership.findMany({
        where: { projectId },
        include: { user: true },
      });

      // For now, we'll just log the notification
      // In a real implementation, you'd check if users are online/offline
      console.log(`Notification for project ${projectId}: ${message}`);
      console.log(`Members to notify: ${members.length}`);

      // Send email notifications to offline members
      const offlineEmails = new Set(members.map(m => m.user.email));
      
      await Promise.all(
        members
          .filter(m => offlineEmails.has(m.user.email))
          .map(m => this.mail.sendOtp(m.user.email, message))
      );
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  }
}

