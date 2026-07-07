import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SMS_SENDER } from './sms-sender.interface';

@Module({
  providers: [SmsService, { provide: SMS_SENDER, useExisting: SmsService }],
  exports: [SmsService, SMS_SENDER],
})
export class SmsModule {}
