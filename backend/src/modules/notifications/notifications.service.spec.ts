import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { MessageStatus } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_QUEUE } from './notifications.constants';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const prismaMock = {
    messageLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const queueMock = { add: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: getQueueToken(SMS_QUEUE), useValue: queueMock },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  describe('findLogs', () => {
    it('returns recent logs with no filter', async () => {
      prismaMock.messageLog.findMany.mockResolvedValue([]);
      await service.findLogs();
      expect(prismaMock.messageLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('filters by status when provided', async () => {
      prismaMock.messageLog.findMany.mockResolvedValue([]);
      await service.findLogs(MessageStatus.FAILED);
      expect(prismaMock.messageLog.findMany).toHaveBeenCalledWith({
        where: { status: MessageStatus.FAILED },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('resend', () => {
    it('throws NotFoundException when the log does not exist', async () => {
      prismaMock.messageLog.findUnique.mockResolvedValue(null);
      await expect(service.resend('missing')).rejects.toThrow(NotFoundException);
    });

    it('resets status to PENDING and re-enqueues the same message', async () => {
      prismaMock.messageLog.findUnique.mockResolvedValue({
        id: 'log1',
        mobile: '09121234567',
        message: 'hello',
        status: MessageStatus.FAILED,
      });
      prismaMock.messageLog.update.mockResolvedValue({ id: 'log1', status: MessageStatus.PENDING });

      const result = await service.resend('log1');

      expect(prismaMock.messageLog.update).toHaveBeenCalledWith({
        where: { id: 'log1' },
        data: { status: MessageStatus.PENDING, error: null },
      });
      expect(queueMock.add).toHaveBeenCalledWith(
        SMS_QUEUE,
        { logId: 'log1', mobile: '09121234567', message: 'hello' },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
      expect(result.status).toBe(MessageStatus.PENDING);
    });
  });
});
