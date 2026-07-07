import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminServiceType, CaseStatus } from '@prisma/client';
import { AdminServiceRequestsService } from './admin-service-requests.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PORT } from '../storage/storage-port.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';

describe('AdminServiceRequestsService', () => {
  let service: AdminServiceRequestsService;

  const prismaMock = {
    adminServiceRequest: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    caseStatusHistory: { create: jest.fn() },
    $transaction: jest.fn(),
  };
  const storageMock = { upload: jest.fn() };
  const notificationsMock = { enqueueSms: jest.fn() };
  const settingsMock = {
    getSmsTemplate: jest.fn().mockResolvedValue('وضعیت پرونده {trackingCode} تغییر کرد.'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    settingsMock.getSmsTemplate.mockResolvedValue('وضعیت پرونده {trackingCode} تغییر کرد.');
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminServiceRequestsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: STORAGE_PORT, useValue: storageMock },
        { provide: NotificationsService, useValue: notificationsMock },
        { provide: SettingsService, useValue: settingsMock },
      ],
    }).compile();

    service = moduleRef.get(AdminServiceRequestsService);
  });

  describe('create', () => {
    it('uploads documents, generates a unique tracking code, and records SUBMITTED history in one transaction', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue(null);
      storageMock.upload.mockResolvedValue('https://cdn.example.com/case-documents/x.pdf');

      const txAdminServiceRequest = {
        create: jest.fn().mockResolvedValue({ id: 'req1', trackingCode: 'ABCDEF12' }),
      };
      const txCaseStatusHistory = { create: jest.fn().mockResolvedValue({}) };
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({ adminServiceRequest: txAdminServiceRequest, caseStatusHistory: txCaseStatusHistory }),
      );

      const result = await service.create(
        { contactMobile: '09121234567', serviceType: AdminServiceType.SINGLE_DEED },
        [{ buffer: Buffer.from(''), mimetype: 'application/pdf', originalname: 'deed.pdf' }],
      );

      expect(storageMock.upload).toHaveBeenCalledWith('case-documents', expect.any(Object));
      expect(txCaseStatusHistory.create).toHaveBeenCalledWith({
        data: { requestId: 'req1', oldStatus: null, newStatus: CaseStatus.SUBMITTED },
      });
      expect(result).toEqual({ id: 'req1', trackingCode: 'ABCDEF12' });
    });
  });

  describe('trackByCode', () => {
    it('throws NotFoundException for unknown codes', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue(null);
      await expect(service.trackByCode('MISSING1')).rejects.toThrow(NotFoundException);
    });

    it('never selects contactMobile or documents', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue({
        id: 'req1',
        trackingCode: 'ABCDEF12',
      });
      await service.trackByCode('ABCDEF12');

      const callArgs = prismaMock.adminServiceRequest.findUnique.mock.calls[0][0];
      expect(callArgs.select.contactMobile).toBeUndefined();
      expect(callArgs.select.documents).toBeUndefined();
    });

    it('normalizes a lowercase/whitespace-padded code before lookup', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue({
        id: 'req1',
        trackingCode: 'ABCDEF12',
      });
      await service.trackByCode('  abcdef12  ');

      const callArgs = prismaMock.adminServiceRequest.findUnique.mock.calls[0][0];
      expect(callArgs.where.trackingCode).toBe('ABCDEF12');
    });
  });

  describe('findAllForAdmin', () => {
    it('orders cases by newest first with no filter', async () => {
      prismaMock.adminServiceRequest.findMany.mockResolvedValue([]);
      await service.findAllForAdmin();
      expect(prismaMock.adminServiceRequest.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by status when provided', async () => {
      prismaMock.adminServiceRequest.findMany.mockResolvedValue([]);
      await service.findAllForAdmin(CaseStatus.DOCUMENT_REVIEW);
      expect(prismaMock.adminServiceRequest.findMany).toHaveBeenCalledWith({
        where: { status: CaseStatus.DOCUMENT_REVIEW },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOneForAdmin', () => {
    it('throws NotFoundException when missing', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue(null);
      await expect(service.findOneForAdmin('missing')).rejects.toThrow(NotFoundException);
    });

    it('includes documents and status history', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue({ id: 'req1' });
      await service.findOneForAdmin('req1');
      const callArgs = prismaMock.adminServiceRequest.findUnique.mock.calls[0][0];
      expect(callArgs.include.documents).toBeDefined();
      expect(callArgs.include.statusHistory).toBeDefined();
    });
  });

  describe('previewSms', () => {
    it('renders the configured template without sending or persisting anything', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue({
        id: 'req1',
        trackingCode: 'ABCDEF12',
      });

      const result = await service.previewSms('req1', CaseStatus.COMPLETED);

      expect(result).toEqual({ message: 'وضعیت پرونده ABCDEF12 تغییر کرد.' });
      expect(notificationsMock.enqueueSms).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('updateInternalNotes', () => {
    it('throws NotFoundException when missing', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue(null);
      await expect(service.updateInternalNotes('missing', 'note')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates the internal notes field', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue({ id: 'req1' });
      prismaMock.adminServiceRequest.update.mockResolvedValue({
        id: 'req1',
        internalNotes: 'note',
      });

      const result = await service.updateInternalNotes('req1', 'note');

      expect(prismaMock.adminServiceRequest.update).toHaveBeenCalledWith({
        where: { id: 'req1' },
        data: { internalNotes: 'note' },
      });
      expect(result.internalNotes).toBe('note');
    });
  });

  describe('updateStatus', () => {
    it('updates status, records history, and enqueues an SMS built from the configured template', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue({
        id: 'req1',
        status: CaseStatus.SUBMITTED,
        contactMobile: '09121234567',
        trackingCode: 'ABCDEF12',
      });

      const updatedRequest = {
        id: 'req1',
        status: CaseStatus.DOCUMENT_REVIEW,
        contactMobile: '09121234567',
        trackingCode: 'ABCDEF12',
      };
      const txAdminServiceRequest = { update: jest.fn().mockResolvedValue(updatedRequest) };
      const txCaseStatusHistory = { create: jest.fn().mockResolvedValue({}) };
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({ adminServiceRequest: txAdminServiceRequest, caseStatusHistory: txCaseStatusHistory }),
      );

      const result = await service.updateStatus('req1', { status: CaseStatus.DOCUMENT_REVIEW });

      expect(txCaseStatusHistory.create).toHaveBeenCalledWith({
        data: {
          requestId: 'req1',
          oldStatus: CaseStatus.SUBMITTED,
          newStatus: CaseStatus.DOCUMENT_REVIEW,
          note: undefined,
        },
      });
      expect(settingsMock.getSmsTemplate).toHaveBeenCalledWith(CaseStatus.DOCUMENT_REVIEW);
      expect(notificationsMock.enqueueSms).toHaveBeenCalledWith(
        '09121234567',
        'وضعیت پرونده ABCDEF12 تغییر کرد.',
      );
      expect(result).toEqual(updatedRequest);
    });

    it('throws NotFoundException when the case does not exist', async () => {
      prismaMock.adminServiceRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus('missing', { status: CaseStatus.COMPLETED }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
