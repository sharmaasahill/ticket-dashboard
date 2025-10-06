import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../realtime/gateway';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService, private readonly gateway: AppGateway) {}

  get(id: string) {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  async create(input: { projectId: string; title: string; description?: string }) {
    const ticket = await this.prisma.ticket.create({ data: input });
    this.gateway.emitTicketUpdated(ticket.projectId, { type: 'created', ticket });
    return ticket;
  }

  async update(id: string, input: Record<string, unknown>) {
    const ticket = await this.prisma.ticket.update({ where: { id }, data: input });
    this.gateway.emitTicketUpdated(ticket.projectId, { type: 'updated', ticket });
    return ticket;
  }
}


