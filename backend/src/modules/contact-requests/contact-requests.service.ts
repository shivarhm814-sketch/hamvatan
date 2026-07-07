import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactRequest } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Injectable()
export class ContactRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactRequestDto): Promise<ContactRequest> {
    return this.prisma.contactRequest.create({ data: dto });
  }

  findAll(): Promise<ContactRequest[]> {
    return this.prisma.contactRequest.findMany({
      orderBy: [{ isHandled: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async markHandled(id: string): Promise<ContactRequest> {
    const existing = await this.prisma.contactRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('پیام مورد نظر یافت نشد.');
    }
    return this.prisma.contactRequest.update({ where: { id }, data: { isHandled: true } });
  }
}
