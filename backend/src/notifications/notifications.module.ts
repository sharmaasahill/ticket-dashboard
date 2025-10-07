import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../common/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

