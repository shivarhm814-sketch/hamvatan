import { Injectable } from '@nestjs/common';
import { CaseStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_SMS_TEMPLATES,
  SETTING_KEYS,
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

  async getSmsTemplates(): Promise<Record<CaseStatus, string>> {
    const statuses = Object.keys(DEFAULT_SMS_TEMPLATES) as CaseStatus[];
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: statuses.map((status) => smsTemplateKey(status)) } },
    });
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

    return statuses.reduce(
      (acc, status) => {
        acc[status] = stored[smsTemplateKey(status)] ?? DEFAULT_SMS_TEMPLATES[status];
        return acc;
      },
      {} as Record<CaseStatus, string>,
    );
  }

  async getSmsTemplate(status: CaseStatus): Promise<string> {
    const row = await this.prisma.setting.findUnique({ where: { key: smsTemplateKey(status) } });
    return row?.value ?? DEFAULT_SMS_TEMPLATES[status];
  }

  async updateSmsTemplate(status: CaseStatus, template: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key: smsTemplateKey(status) },
      update: { value: template },
      create: { key: smsTemplateKey(status), value: template },
    });
  }

  async getServiceStatus(): Promise<{ smsProvider: string; storageConfigured: boolean }> {
    return {
      smsProvider: this.configService.get<string>('sms.provider') ?? 'mock',
      storageConfigured: Boolean(this.configService.get<string>('storage.accessKeyId')),
    };
  }
}
