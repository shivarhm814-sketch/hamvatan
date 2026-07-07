import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactRequestsService } from './contact-requests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContactRequestsService', () => {
  let service: ContactRequestsService;
  const prismaMock = {
    contactRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ContactRequestsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(ContactRequestsService);
  });

  it('findAll orders unhandled messages first', async () => {
    prismaMock.contactRequest.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(prismaMock.contactRequest.findMany).toHaveBeenCalledWith({
      orderBy: [{ isHandled: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('markHandled throws NotFoundException when missing', async () => {
    prismaMock.contactRequest.findUnique.mockResolvedValue(null);
    await expect(service.markHandled('missing')).rejects.toThrow(NotFoundException);
  });

  it('markHandled sets isHandled true', async () => {
    prismaMock.contactRequest.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.contactRequest.update.mockResolvedValue({ id: 'c1', isHandled: true });
    const result = await service.markHandled('c1');
    expect(prismaMock.contactRequest.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isHandled: true },
    });
    expect(result.isHandled).toBe(true);
  });
});
