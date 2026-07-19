import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PropertyStatus } from '@prisma/client';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PORT } from '../storage/storage-port.interface';

describe('PropertiesService', () => {
  let service: PropertiesService;

  const prismaMock = {
    property: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    propertyImage: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  const storageMock = { upload: jest.fn(), delete: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: STORAGE_PORT, useValue: storageMock },
      ],
    }).compile();

    service = moduleRef.get(PropertiesService);
  });

  it('findAll runs findMany and count atomically and returns pagination metadata', async () => {
    prismaMock.property.findMany.mockResolvedValue([{ id: 'p1' }]);
    prismaMock.property.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 12 });

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result).toEqual({ items: [{ id: 'p1' }], total: 1, page: 1, limit: 12 });
  });

  it('findOneActive throws NotFoundException when not found', async () => {
    prismaMock.property.findFirst.mockResolvedValue(null);
    await expect(service.findOneActive('missing')).rejects.toThrow(NotFoundException);
  });

  it('findOneActive only returns ACTIVE listings', async () => {
    prismaMock.property.findFirst.mockResolvedValue({ id: 'p1', status: PropertyStatus.ACTIVE });
    await service.findOneActive('p1');
    expect(prismaMock.property.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'p1', status: PropertyStatus.ACTIVE } }),
    );
  });

  it('archive sets status to ARCHIVED (soft delete)', async () => {
    prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.property.update.mockResolvedValue({ id: 'p1', status: PropertyStatus.ARCHIVED });

    const result = await service.archive('p1');

    expect(prismaMock.property.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { status: PropertyStatus.ARCHIVED },
    });
    expect(result.status).toBe(PropertyStatus.ARCHIVED);
  });

  const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  it('addImage throws NotFoundException before attempting upload when property is missing', async () => {
    prismaMock.property.findUnique.mockResolvedValue(null);

    await expect(
      service.addImage('missing', {
        buffer: Buffer.from(''),
        mimetype: 'image/png',
        originalname: 'a.png',
      } as Express.Multer.File),
    ).rejects.toThrow(NotFoundException);
    expect(storageMock.upload).not.toHaveBeenCalled();
  });

  it('addImage rejects a file whose real content is not JPEG/PNG, even with a spoofed mimetype', async () => {
    prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });

    await expect(
      service.addImage('p1', {
        buffer: Buffer.from('<svg onload=alert(1)>'),
        mimetype: 'image/png',
        originalname: 'a.png',
      } as Express.Multer.File),
    ).rejects.toThrow('فقط فایل‌های JPEG یا PNG مجاز هستند.');
    expect(storageMock.upload).not.toHaveBeenCalled();
  });

  it('addImage uploads and persists the returned url', async () => {
    prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
    storageMock.upload.mockResolvedValue('https://cdn.example.com/properties/x.png');
    prismaMock.propertyImage.create.mockResolvedValue({
      id: 'img1',
      url: 'https://cdn.example.com/properties/x.png',
    });

    const result = await service.addImage('p1', {
      buffer: PNG_MAGIC_BYTES,
      mimetype: 'image/png',
      originalname: 'a.png',
    } as Express.Multer.File);

    expect(storageMock.upload).toHaveBeenCalledWith('properties', {
      buffer: PNG_MAGIC_BYTES,
      mimetype: 'image/png',
      extension: '.png',
    });
    expect(result.url).toBe('https://cdn.example.com/properties/x.png');
  });

  describe('findAllForAdmin', () => {
    it('includes non-ACTIVE statuses when filtered', async () => {
      prismaMock.property.findMany.mockResolvedValue([
        { id: 'p1', status: PropertyStatus.ARCHIVED },
      ]);
      prismaMock.property.count.mockResolvedValue(1);

      const result = await service.findAllForAdmin({
        status: PropertyStatus.ARCHIVED,
        page: 1,
        limit: 20,
      });

      expect(prismaMock.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: PropertyStatus.ARCHIVED } }),
      );
      expect(result.items).toHaveLength(1);
    });

    it('has no status restriction when no filter is provided', async () => {
      prismaMock.property.findMany.mockResolvedValue([]);
      prismaMock.property.count.mockResolvedValue(0);

      await service.findAllForAdmin({ page: 1, limit: 20 });

      expect(prismaMock.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('deleteImage', () => {
    it('throws NotFoundException when the image does not belong to the property', async () => {
      prismaMock.propertyImage.findFirst.mockResolvedValue(null);

      await expect(service.deleteImage('p1', 'img1')).rejects.toThrow(NotFoundException);
      expect(storageMock.delete).not.toHaveBeenCalled();
    });

    it('deletes the db record and the stored file', async () => {
      prismaMock.propertyImage.findFirst.mockResolvedValue({
        id: 'img1',
        propertyId: 'p1',
        url: 'https://cdn.example.com/properties/x.png',
      });

      await service.deleteImage('p1', 'img1');

      expect(prismaMock.propertyImage.delete).toHaveBeenCalledWith({ where: { id: 'img1' } });
      expect(storageMock.delete).toHaveBeenCalledWith('https://cdn.example.com/properties/x.png');
    });
  });

  describe('reorderImages', () => {
    it('throws when the submitted image ids do not match the property images', async () => {
      prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
      prismaMock.propertyImage.findMany.mockResolvedValue([{ id: 'img1' }, { id: 'img2' }]);

      await expect(service.reorderImages('p1', ['img1', 'img3'])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates sortOrder to match the submitted order', async () => {
      prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
      prismaMock.propertyImage.findMany
        .mockResolvedValueOnce([{ id: 'img1' }, { id: 'img2' }])
        .mockResolvedValueOnce([
          { id: 'img2', sortOrder: 0 },
          { id: 'img1', sortOrder: 1 },
        ]);

      const result = await service.reorderImages('p1', ['img2', 'img1']);

      expect(prismaMock.propertyImage.update).toHaveBeenCalledWith({
        where: { id: 'img2' },
        data: { sortOrder: 0 },
      });
      expect(prismaMock.propertyImage.update).toHaveBeenCalledWith({
        where: { id: 'img1' },
        data: { sortOrder: 1 },
      });
      expect(result[0].id).toBe('img2');
    });
  });
});
