import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MailModule } from '../common/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}


