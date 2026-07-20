import { Injectable } from '@nestjs/common';
import { AdminServiceType, CaseStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_SMS_TEMPLATES,
  SERVICE_CATEGORIES,
  SETTING_KEYS,
  ServiceCategory,
  serviceCategoryOf,
  smsTemplateKey,
} from './settings.constants';

export type ContactSettings = Record<keyof typeof SETTING_KEYS, string>;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getContactSettings(): Promise<Record<string, string>> {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: Object.values(SETTING_KEYS) } },
    });
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return { ...DEFAULT_CONTACT_SETTINGS, ...stored };
  }

  async updateContactSettings(
    values: Partial<Record<string, string>>,
  ): Promise<Record<string, string>> {
    const allowedKeys = new Set<string>(Object.values(SETTING_KEYS));
    const entries = Object.entries(values).filter(([key]) => allowedKeys.has(key));

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          update: { value: value ?? '' },
          create: { key, value: value ?? '' },
        }),
      ),
    );

    return this.getContactSettings();
  }

  async getSmsTemplates(): Promise<Record<ServiceCategory, Record<CaseStatus, string>>> {
    const statuses = Object.keys(DEFAULT_SMS_TEMPLATES.DEED) as CaseStatus[];
    const allKeys = SERVICE_CATEGORIES.flatMap((category) =>
      statuses.map((status) => smsTemplateKey(status, category)),
    );
    const rows = await this.prisma.setting.findMany({ where: { key: { in: allKeys } } });
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

    return SERVICE_CATEGORIES.reduce(
      (acc, category) => {
        acc[category] = statuses.reduce(
          (statusAcc, status) => {
            statusAcc[status] = stored[smsTemplateKey(status, category)] ?? DEFAULT_SMS_TEMPLATES[category][status];
            return statusAcc;
          },
          {} as Record<CaseStatus, string>,
        );
        return acc;
      },
      {} as Record<ServiceCategory, Record<CaseStatus, string>>,
    );
  }

  async getSmsTemplate(status: CaseStatus, serviceType?: AdminServiceType): Promise<string> {
    const category = serviceCategoryOf(serviceType);
    const row = await this.prisma.setting.findUnique({
      where: { key: smsTemplateKey(status, category) },
    });
    return row?.value ?? DEFAULT_SMS_TEMPLATES[category][status];
  }

  async updateSmsTemplate(
    status: CaseStatus,
    category: ServiceCategory,
    template: string,
  ): Promise<void> {
    const key = smsTemplateKey(status, category);
    await this.prisma.setting.upsert({
      where: { key },
      update: { value: template },
      create: { key, value: template },
    });
  }

  async getServiceStatus(): Promise<{ smsProvider: string; storageConfigured: boolean }> {
    return {
      smsProvider: this.configService.get<string>('sms.provider') ?? 'mock',
      storageConfigured: Boolean(this.configService.get<string>('storage.accessKeyId')),
    };
  }
}
