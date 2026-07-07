import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateByMobile(mobile: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { mobile },
      update: {},
      create: { mobile },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.assertExists(id);
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    await this.assertExists(id);
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  private async assertExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('کاربر مورد نظر یافت نشد.');
    }
  }
}
