import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AdminServiceRequest, CaseStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PORT, StoragePort, UploadableFile } from '../storage/storage-port.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { renderTemplate } from '../settings/settings.constants';
import { SettingsService } from '../settings/settings.service';
import { CreateAdminServiceRequestDto } from './dto/create-admin-service-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AdminServiceRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(
    dto: CreateAdminServiceRequestDto,
    files: UploadableFile[],
    userId?: string,
  ): Promise<AdminServiceRequest> {
    const trackingCode = await this.generateUniqueTrackingCode();

    const documentUrls = await Promise.all(
      files.map((file) => this.storage.upload('case-documents', file)),
    );

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.adminServiceRequest.create({
        data: {
          trackingCode,
          userId,
          contactMobile: dto.contactMobile,
          serviceType: dto.serviceType,
          notes: dto.notes,
          documents: {
            create: documentUrls.map((url, index) => ({
              fileUrl: url,
              fileName: files[index].originalname,
            })),
          },
        },
      });

      await tx.caseStatusHistory.create({
        data: {
          requestId: request.id,
          oldStatus: null,
          newStatus: CaseStatus.SUBMITTED,
        },
      });

      return request;
    });
  }

  async findAllForAdmin(status?: CaseStatus): Promise<AdminServiceRequest[]> {
    const where: Prisma.AdminServiceRequestWhereInput = status ? { status } : {};
    return this.prisma.adminServiceRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOneForAdmin(id: string) {
    const request = await this.prisma.adminServiceRequest.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { createdAt: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!request) {
      throw new NotFoundException('پرونده مورد نظر یافت نشد.');
    }
    return request;
  }

  async trackByCode(trackingCode: string) {
    const normalizedCode = trackingCode.trim().toUpperCase();
    const request = await this.prisma.adminServiceRequest.findUnique({
      where: { trackingCode: normalizedCode },
      select: {
        id: true,
        trackingCode: true,
        serviceType: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, oldStatus: true, newStatus: true, note: true, createdAt: true },
        },
      },
    });
    if (!request) {
      throw new NotFoundException('پرونده‌ای با این کد رهگیری یافت نشد.');
    }

    return request;
  }

  async previewSms(id: string, status: CaseStatus): Promise<{ message: string }> {
    const existing = await this.prisma.adminServiceRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('پرونده مورد نظر یافت نشد.');
    }
    const message = await this.buildStatusSmsMessage(existing.trackingCode, status);
    return { message };
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<AdminServiceRequest> {
    const existing = await this.prisma.adminServiceRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('پرونده مورد نظر یافت نشد.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const request = await tx.adminServiceRequest.update({
        where: { id },
        data: { status: dto.status },
      });

      await tx.caseStatusHistory.create({
        data: {
          requestId: id,
          oldStatus: existing.status,
          newStatus: dto.status,
          note: dto.note,
        },
      });

      return request;
    });

    const message = await this.buildStatusSmsMessage(updated.trackingCode, dto.status);
    await this.notificationsService.enqueueSms(updated.contactMobile, message);

    return updated;
  }

  async updateInternalNotes(id: string, internalNotes: string): Promise<AdminServiceRequest> {
    const existing = await this.prisma.adminServiceRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('پرونده مورد نظر یافت نشد.');
    }
    return this.prisma.adminServiceRequest.update({ where: { id }, data: { internalNotes } });
  }

  private async buildStatusSmsMessage(trackingCode: string, status: CaseStatus): Promise<string> {
    const template = await this.settingsService.getSmsTemplate(status);
    return renderTemplate(template, { trackingCode });
  }

  private async generateUniqueTrackingCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.prisma.adminServiceRequest.findUnique({
        where: { trackingCode: code },
      });
      if (!existing) {
        return code;
      }
    }
    throw new Error('امکان تولید کد رهگیری یکتا وجود ندارد.');
  }
}
