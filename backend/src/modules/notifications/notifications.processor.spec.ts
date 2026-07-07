import { Test } from '@nestjs/testing';
import { MessageStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { NotificationsProcessor } from './notifications.processor';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_SENDER } from '../sms/sms-sender.interface';
import { SmsJobData } from './notifications.constants';

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;
  const prismaMock = { messageLog: { update: jest.fn() } };
  const smsMock = { send: jest.fn(), sendOtp: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SMS_SENDER, useValue: smsMock },
      ],
    }).compile();

    processor = moduleRef.get(NotificationsProcessor);
  });

  const buildJob = (data: SmsJobData): Job<SmsJobData> => ({ data }) as Job<SmsJobData>;

  it('marks the log SENT on success', async () => {
    smsMock.send.mockResolvedValue(undefined);

    await processor.process(buildJob({ logId: 'log1', mobile: '09121234567', message: 'hi' }));

    expect(prismaMock.messageLog.update).toHaveBeenCalledWith({
      where: { id: 'log1' },
      data: { status: MessageStatus.SENT, error: null },
    });
  });

  it('marks the log FAILED and re-throws on error so BullMQ retries', async () => {
    smsMock.send.mockRejectedValue(new Error('provider down'));

    await expect(
      processor.process(buildJob({ logId: 'log1', mobile: '09121234567', message: 'hi' })),
    ).rejects.toThrow('provider down');

    expect(prismaMock.messageLog.update).toHaveBeenCalledWith({
      where: { id: 'log1' },
      data: { status: MessageStatus.FAILED, error: 'provider down' },
    });
  });
});
