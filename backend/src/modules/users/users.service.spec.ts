import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  const prismaMock = {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('findOrCreateByMobile performs an atomic upsert keyed by mobile', async () => {
    const user = { id: 'u1', mobile: '09121234567' };
    prismaMock.user.upsert.mockResolvedValue(user);

    const result = await service.findOrCreateByMobile('09121234567');

    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { mobile: '09121234567' },
      update: {},
      create: { mobile: '09121234567' },
    });
    expect(result).toEqual(user);
  });

  it('findById returns null when not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await service.findById('missing');
    expect(result).toBeNull();
  });

  describe('updateRole', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.updateRole('missing', UserRole.STAFF)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates the role of an existing user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
      prismaMock.user.update.mockResolvedValue({ id: 'u1', role: UserRole.STAFF });

      const result = await service.updateRole('u1', UserRole.STAFF);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: UserRole.STAFF },
      });
      expect(result.role).toBe(UserRole.STAFF);
    });
  });

  describe('setActive', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.setActive('missing', false)).rejects.toThrow(NotFoundException);
    });

    it('can deactivate a user without deleting them', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
      prismaMock.user.update.mockResolvedValue({ id: 'u1', isActive: false });

      const result = await service.setActive('u1', false);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });
  });
});
