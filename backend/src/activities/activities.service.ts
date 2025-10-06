import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  log(params: { projectId: string; ticketId?: string; actorId: string; message: string; type: string }) {
    return this.prisma.activity.create({ data: params });
  }

  listRecent(projectId: string) {
    return this.prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}


