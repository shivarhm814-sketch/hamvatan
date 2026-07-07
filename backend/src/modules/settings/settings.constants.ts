import { CaseStatus } from '@prisma/client';

export const SETTING_KEYS = {
  CONTACT_PHONE: 'contact.phone',
  CONTACT_PHONE_SECONDARY: 'contact.phoneSecondary',
  CONTACT_WHATSAPP: 'contact.whatsapp',
  CONTACT_ADDRESS: 'contact.address',
  CONTACT_WORKING_HOURS: 'contact.workingHours',
} as const;

export const DEFAULT_CONTACT_SETTINGS: Record<
  (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS],
  string
> = {
  [SETTING_KEYS.CONTACT_PHONE]: '09113308947',
  [SETTING_KEYS.CONTACT_PHONE_SECONDARY]: '09903692519',
  [SETTING_KEYS.CONTACT_WHATSAPP]: '09903692519',
  [SETTING_KEYS.CONTACT_ADDRESS]: '',
  [SETTING_KEYS.CONTACT_WORKING_HOURS]: 'شنبه تا پنجشنبه، ۹ تا ۱۹',
};

export const smsTemplateKey = (status: CaseStatus): string => `sms.template.${status}`;

export const DEFAULT_SMS_TEMPLATES: Record<CaseStatus, string> = {
  SUBMITTED:
    'درخواست شما با کد رهگیری {trackingCode} ثبت شد. به‌زودی توسط کارشناسان ما بررسی می‌شود.',
  DOCUMENT_REVIEW: 'پرونده {trackingCode} در حال بررسی مدارک است.',
  AGENCY_FOLLOW_UP: 'پرونده {trackingCode} در حال پیگیری اداری و ثبتی است.',
  COMPLETED: 'پرونده {trackingCode} تکمیل شد و سند صادر گردید.',
  FAILED: 'متأسفانه پرونده {trackingCode} در حال حاضر قابل تکمیل نیست. لطفاً با ما تماس بگیرید.',
};

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}
