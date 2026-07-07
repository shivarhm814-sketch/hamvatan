import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SmsModule } from '../sms/sms.module';
import { SMS_QUEUE } from './notifications.constants';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [BullModule.registerQueue({ name: SMS_QUEUE }), SmsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
