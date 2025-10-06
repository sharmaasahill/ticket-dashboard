import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ActivitiesService } from './activities.service';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get(':projectId')
  list(@Param('projectId') projectId: string) {
    return this.activities.listRecent(projectId);
  }
}


