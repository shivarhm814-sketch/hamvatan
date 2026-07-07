import { Test } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const prismaMock = {
    property: { count: jest.fn() },
    adminServiceRequest: { count: jest.fn(), findMany: jest.fn() },
    contactRequest: { count: jest.fn(), findMany: jest.fn() },
    user: { count: jest.fn() },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = moduleRef.get(DashboardService);
  });

  it('aggregates all summary figures in a single transaction', async () => {
    prismaMock.property.count.mockResolvedValue(7);
    prismaMock.adminServiceRequest.count.mockResolvedValue(3);
    prismaMock.contactRequest.count.mockResolvedValue(2);
    prismaMock.user.count.mockResolvedValue(4);
    prismaMock.adminServiceRequest.findMany.mockResolvedValue([{ id: 'c1' }]);
    prismaMock.contactRequest.findMany.mockResolvedValue([{ id: 'm1' }]);

    const result = await service.getSummary();

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result).toEqual({
      activeProperties: 7,
      inProgressCases: 3,
      unhandledContacts: 2,
      newUsersThisWeek: 4,
      recentCases: [{ id: 'c1' }],
      recentContacts: [{ id: 'm1' }],
    });
  });
});
