import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../realtime/gateway';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
    private readonly activities: ActivitiesService,
  ) {}

  get(id: string) {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  async create(input: { projectId: string; title: string; description?: string; authorId?: string }) {
    const ticket = await this.prisma.ticket.create({ data: { ...input, authorId: input.authorId ?? undefined } as any });
    this.gateway.emitTicketUpdated(ticket.projectId, { type: 'created', ticket });
    await this.activities.log({ projectId: ticket.projectId, ticketId: ticket.id, actorId: input.authorId ?? 'system', type: 'create', message: `Ticket created: ${ticket.title}` });
    return ticket;
  }

  async update(id: string, input: Record<string, unknown> & { actorId?: string }) {
    const ticket = await this.prisma.ticket.update({ where: { id }, data: input });
    this.gateway.emitTicketUpdated(ticket.projectId, { type: 'updated', ticket });
    await this.activities.log({ projectId: ticket.projectId, ticketId: ticket.id, actorId: (input as any).actorId ?? 'system', type: 'update', message: `Ticket updated: ${ticket.title}` });
    return ticket;
  }
}


