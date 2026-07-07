import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { MessageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_SENDER, SmsSender } from '../sms/sms-sender.interface';
import { SMS_QUEUE, SmsJobData } from './notifications.constants';

@Processor(SMS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SMS_SENDER) private readonly smsSender: SmsSender,
  ) {
    super();
  }

  async process(job: Job<SmsJobData>): Promise<void> {
    const { logId, mobile, message } = job.data;

    try {
      await this.smsSender.send(mobile, message);
      await this.prisma.messageLog.update({
        where: { id: logId },
        data: { status: MessageStatus.SENT, error: null },
      });
    } catch (error) {
      await this.prisma.messageLog.update({
        where: { id: logId },
        data: { status: MessageStatus.FAILED, error: (error as Error).message },
      });
      throw error;
    }
  }
}
