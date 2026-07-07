import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { MessageLog, MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_QUEUE, SmsJobData } from './notifications.constants';

const RECENT_LOGS_LIMIT = 100;

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(SMS_QUEUE) private readonly smsQueue: Queue<SmsJobData>,
  ) {}

  async enqueueSms(mobile: string, message: string): Promise<void> {
    const log = await this.prisma.messageLog.create({
      data: { mobile, message, status: MessageStatus.PENDING },
    });

    await this.smsQueue.add(
      SMS_QUEUE,
      { logId: log.id, mobile, message },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
  }

  async findLogs(status?: MessageStatus): Promise<MessageLog[]> {
    const where: Prisma.MessageLogWhereInput = status ? { status } : {};
    return this.prisma.messageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: RECENT_LOGS_LIMIT,
    });
  }

  async resend(id: string): Promise<MessageLog> {
    const log = await this.prisma.messageLog.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException('پیامک مورد نظر یافت نشد.');
    }

    const updated = await this.prisma.messageLog.update({
      where: { id },
      data: { status: MessageStatus.PENDING, error: null },
    });

    await this.smsQueue.add(
      SMS_QUEUE,
      { logId: log.id, mobile: log.mobile, message: log.message },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    return updated;
  }
}
