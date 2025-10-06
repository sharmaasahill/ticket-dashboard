import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [RealtimeModule, ActivitiesModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}


