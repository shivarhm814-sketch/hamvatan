import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Property, PropertyImage, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PORT, StoragePort, UploadableFile } from '../storage/storage-port.interface';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryAdminPropertiesDto } from './dto/query-admin-properties.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

export interface PaginatedProperties {
  items: Property[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async findAll(query: QueryPropertiesDto): Promise<PaginatedProperties> {
    const { type, dealType, province, city, minPrice, maxPrice, page, limit } = query;

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.ACTIVE,
      ...(type && { type }),
      ...(dealType && { dealType }),
      ...(province && { province }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOneActive(id: string): Promise<Property> {
    const property = await this.prisma.property.findFirst({
      where: { id, status: PropertyStatus.ACTIVE },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!property) {
      throw new NotFoundException('آگهی مورد نظر یافت نشد.');
    }
    return property;
  }

  async findAllForAdmin(query: QueryAdminPropertiesDto): Promise<PaginatedProperties> {
    const { status, type, dealType, province, city, page, limit } = query;

    const where: Prisma.PropertyWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(dealType && { dealType }),
      ...(province && { province }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOneForAdmin(id: string): Promise<Property> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!property) {
      throw new NotFoundException('آگهی مورد نظر یافت نشد.');
    }
    return property;
  }

  async create(dto: CreatePropertyDto, ownerId?: string): Promise<Property> {
    return this.prisma.property.create({
      data: { ...dto, ownerId },
    });
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    await this.findOneForAdmin(id);
    return this.prisma.property.update({ where: { id }, data: dto });
  }

  async archive(id: string): Promise<Property> {
    await this.findOneForAdmin(id);
    return this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.ARCHIVED },
    });
  }

  async addImage(id: string, file: UploadableFile): Promise<PropertyImage> {
    await this.findOneForAdmin(id);
    const url = await this.storage.upload('properties', file);

    const lastImage = await this.prisma.propertyImage.findFirst({
      where: { propertyId: id },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    return this.prisma.propertyImage.create({
      data: { propertyId: id, url, sortOrder },
    });
  }

  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    const image = await this.prisma.propertyImage.findFirst({
      where: { id: imageId, propertyId },
    });
    if (!image) {
      throw new NotFoundException('تصویر مورد نظر یافت نشد.');
    }

    await this.prisma.propertyImage.delete({ where: { id: imageId } });
    await this.storage.delete(image.url);
  }

  async reorderImages(propertyId: string, imageIds: string[]): Promise<PropertyImage[]> {
    await this.findOneForAdmin(propertyId);

    const existingImages = await this.prisma.propertyImage.findMany({ where: { propertyId } });
    const existingIds = new Set(existingImages.map((image) => image.id));
    const allBelongToProperty = imageIds.every((imageId) => existingIds.has(imageId));
    if (!allBelongToProperty || imageIds.length !== existingImages.length) {
      throw new NotFoundException('لیست تصاویر ارسالی با تصاویر این آگهی مطابقت ندارد.');
    }

    await this.prisma.$transaction(
      imageIds.map((imageId, index) =>
        this.prisma.propertyImage.update({ where: { id: imageId }, data: { sortOrder: index } }),
      ),
    );

    return this.prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
