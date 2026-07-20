import { AdminServiceType, CaseStatus } from '@prisma/client';

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

// پیامک هر وضعیت پرونده باید با نوع درخواست هم‌خوانی داشته باشد — «صدور و تحویل سند» برای
// یک درخواست مشاوره یا پروژه‌ی ساخت بی‌معنی است. به همین دلیل سه دسته‌ی جدا وجود دارد
// (هم‌راستا با caseStatusCategoryOf در frontend/lib/utils.ts).
export const SERVICE_CATEGORIES = ['DEED', 'CONSULTATION', 'CONSTRUCTION'] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

const CONSTRUCTION_SERVICE_TYPES = new Set<AdminServiceType>([
  AdminServiceType.CONSTRUCTION_PARTNERSHIP,
  AdminServiceType.CONSTRUCTION_CONTRACT,
  AdminServiceType.RENOVATION,
  AdminServiceType.SMART_HOME,
  AdminServiceType.DESIGN_ENGINEERING,
]);
const CONSULTATION_SERVICE_TYPES = new Set<AdminServiceType>([
  AdminServiceType.PURCHASE_SALE_CONSULTATION,
  AdminServiceType.OTHER,
]);

export function serviceCategoryOf(serviceType?: AdminServiceType): ServiceCategory {
  if (serviceType && CONSTRUCTION_SERVICE_TYPES.has(serviceType)) return 'CONSTRUCTION';
  if (serviceType && CONSULTATION_SERVICE_TYPES.has(serviceType)) return 'CONSULTATION';
  return 'DEED';
}

export const smsTemplateKey = (status: CaseStatus, category: ServiceCategory): string =>
  `sms.template.${category}.${status}`;

export const DEFAULT_SMS_TEMPLATES: Record<ServiceCategory, Record<CaseStatus, string>> = {
  DEED: {
    SUBMITTED:
      'درخواست شما با کد رهگیری {trackingCode} ثبت شد. به‌زودی توسط کارشناسان ما بررسی می‌شود.',
    DOCUMENT_REVIEW: 'پرونده {trackingCode} در حال بررسی مدارک است.',
    AGENCY_FOLLOW_UP: 'پرونده {trackingCode} در حال پیگیری اداری و ثبتی است.',
    COMPLETED: 'پرونده {trackingCode} تکمیل شد و سند صادر گردید.',
    FAILED: 'متأسفانه پرونده {trackingCode} در حال حاضر قابل تکمیل نیست. لطفاً با ما تماس بگیرید.',
  },
  CONSULTATION: {
    SUBMITTED:
      'درخواست شما با کد رهگیری {trackingCode} ثبت شد. به‌زودی کارشناسان ما با شما تماس می‌گیرند.',
    DOCUMENT_REVIEW: 'درخواست {trackingCode} در حال بررسی اولیه است.',
    AGENCY_FOLLOW_UP: 'درخواست {trackingCode} در حال مذاکره و پیگیری است.',
    COMPLETED: 'درخواست {trackingCode} به نتیجه رسید.',
    FAILED:
      'متأسفانه پیگیری درخواست {trackingCode} بدون نتیجه بسته شد. لطفاً با ما تماس بگیرید.',
  },
  CONSTRUCTION: {
    SUBMITTED:
      'درخواست شما با کد رهگیری {trackingCode} ثبت شد. به‌زودی توسط کارشناسان ما بررسی می‌شود.',
    DOCUMENT_REVIEW: 'پرونده {trackingCode} در حال بررسی و برآورد اولیه است.',
    AGENCY_FOLLOW_UP: 'پروژه {trackingCode} در حال اجراست.',
    COMPLETED: 'پروژه {trackingCode} تکمیل و تحویل داده شد.',
    FAILED: 'متأسفانه پروژه {trackingCode} در حال حاضر قابل ادامه نیست. لطفاً با ما تماس بگیرید.',
  },
};

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}
