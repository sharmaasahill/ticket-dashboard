import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(input: { name: string; description?: string }) {
    return this.prisma.project.create({ data: input });
  }

  getById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { tickets: true },
    });
  }
}


