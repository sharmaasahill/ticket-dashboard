import { Injectable } from '@nestjs/common';
import { MailService } from '../common/mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly mail: MailService, private readonly prisma: PrismaService) {}

  async notifyProjectMembersIfOffline(projectId: string, message: string): Promise<void> {
    const members = await this.prisma.membership.findMany({
      where: { projectId },
      include: { user: true },
    });
    // Naive heuristic: users without recent activity in last 10 minutes are considered offline
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    const offlineUsers = await this.prisma.user.findMany({
      where: { activities: { none: { createdAt: { gt: cutoff }, projectId } } },
    });
    const offlineEmails = new Set(offlineUsers.map((u: { email: string }) => u.email));
    await Promise.all(
      members
        .filter((m: { user: { email: string } }) => offlineEmails.has(m.user.email))
        .map((m: { user: { email: string } }) => this.mail.sendOtp(m.user.email, message))
    );
  }
}


