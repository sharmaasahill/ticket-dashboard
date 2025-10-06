import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(input: { name: string; description?: string; ownerId?: string }) {
    // Create project with ownerId or create a default user
    let ownerId = input.ownerId;
    if (!ownerId) {
      // Find or create a default user
      const defaultUser = await this.prisma.user.upsert({
        where: { email: 'system@ticket-dashboard.local' },
        update: {},
        create: { email: 'system@ticket-dashboard.local', name: 'System' }
      });
      ownerId = defaultUser.id;
    }
    
    return this.prisma.project.create({ 
      data: { 
        name: input.name, 
        description: input.description,
        ownerId: ownerId
      } as any 
    });
  }

  getById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { tickets: true },
    });
  }
}


