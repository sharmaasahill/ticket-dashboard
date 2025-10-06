import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../realtime/gateway';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
    private readonly activities: ActivitiesService,
    private readonly notifications: NotificationsService,
  ) {}

  get(id: string) {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  async create(input: { projectId: string; title: string; description?: string; authorId?: string }) {
    // Find or create a default user for the author
    let authorId = input.authorId;
    if (!authorId) {
      const defaultUser = await this.prisma.user.upsert({
        where: { email: 'system@ticket-dashboard.local' },
        update: {},
        create: { email: 'system@ticket-dashboard.local', name: 'System' }
      });
      authorId = defaultUser.id;
    }

    const ticket = await this.prisma.ticket.create({ 
      data: { 
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        authorId: authorId
      } 
    });
    this.gateway.emitTicketUpdated(ticket.projectId, { type: 'created', ticket });
    await this.activities.log({ projectId: ticket.projectId, ticketId: ticket.id, actorId: authorId, type: 'create', message: `Ticket created: ${ticket.title}` });
    await this.notifications.notifyProjectMembersIfOffline(ticket.projectId, `New ticket: ${ticket.title}`);
    return ticket;
  }

  async update(id: string, input: Record<string, unknown> & { actorId?: string }) {
    const { actorId, ...data } = input as any;
    
    // Find or create a default user for the actor
    let actorIdToUse = actorId;
    if (!actorIdToUse) {
      const defaultUser = await this.prisma.user.upsert({
        where: { email: 'system@ticket-dashboard.local' },
        update: {},
        create: { email: 'system@ticket-dashboard.local', name: 'System' }
      });
      actorIdToUse = defaultUser.id;
    }

    const ticket = await this.prisma.ticket.update({ where: { id }, data: data as any });
    this.gateway.emitTicketUpdated(ticket.projectId, { type: 'updated', ticket });
    await this.activities.log({ projectId: ticket.projectId, ticketId: ticket.id, actorId: actorIdToUse, type: 'update', message: `Ticket updated: ${ticket.title}` });
    await this.notifications.notifyProjectMembersIfOffline(ticket.projectId, `Ticket updated: ${ticket.title}`);
    return ticket;
  }
}


