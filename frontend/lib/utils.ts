const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function formatPriceToman(price: string | number): string {
  const numeric = typeof price === 'string' ? Number(price) : price;
  return toFa(numeric.toLocaleString('en-US'));
}

export function formatTotalFromPricePerSqm(
  pricePerSqm: string | number,
  areaSqm: string | number | null,
): string | null {
  if (!areaSqm) return null;
  const numericPrice = typeof pricePerSqm === 'string' ? Number(pricePerSqm) : pricePerSqm;
  const numericArea = typeof areaSqm === 'string' ? Number(areaSqm) : areaSqm;
  if (!numericArea) return null;
  return toFa(Math.round(numericPrice * numericArea).toLocaleString('en-US'));
}

const PROPERTY_TYPE_LABELS_FA: Record<string, string> = {
  VILLA: 'ویلایی',
  LAND: 'زمین',
  SHOP: 'مغازه',
  APARTMENT: 'آپارتمان',
  PADDY_FIELD: 'بیجار (شالیزار)',
};

export function propertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS_FA[type] ?? type;
}

const DEAL_TYPE_LABELS_FA: Record<string, string> = {
  SALE: 'فروش',
  RENT: 'اجاره',
};

export function dealTypeLabel(type: string): string {
  return DEAL_TYPE_LABELS_FA[type] ?? type;
}

const ADMIN_SERVICE_TYPE_LABELS_FA: Record<string, string> = {
  SINGLE_DEED: 'اخذ سند تک‌برگ (املاک نسقی و سایر موارد)',
  OLD_DEED_CONVERSION: 'تبدیل اسناد قدیمی (دفترچه‌ای) به تک‌برگ',
  SURVEY_SSBR: 'نقشه‌برداری و اخذ کد SSBR',
  SUBDIVISION: 'تفکیک و صورت‌مجلس تفکیکی',
  PURCHASE_SALE_CONSULTATION: 'مشاوره خرید یا فروش ملک',
  OTHER: 'سایر موارد',
  CONSTRUCTION_PARTNERSHIP: 'مشارکت در ساخت',
  CONSTRUCTION_CONTRACT: 'پیمانکاری ساخت',
  RENOVATION: 'بازسازی و نوسازی',
  SMART_HOME: 'ساخت خانه هوشمند',
  DESIGN_ENGINEERING: 'طراحی و نقشه‌کشی',
};

export function adminServiceTypeLabel(type: string): string {
  return ADMIN_SERVICE_TYPE_LABELS_FA[type] ?? type;
}

// وضعیت‌های پرونده (CaseStatus) برای هر سه گروه خدمت مشترک است، اما متن هرکدام باید با
// نوع درخواست هم‌خوانی داشته باشد — «صدور و تحویل سند» برای یک درخواست مشاوره یا پروژه
// ساخت بی‌معنی است، پس بر اساس دسته‌ی serviceType یکی از سه مجموعه‌ی زیر انتخاب می‌شود.
const CONSTRUCTION_SERVICE_TYPES = new Set([
  'CONSTRUCTION_PARTNERSHIP',
  'CONSTRUCTION_CONTRACT',
  'RENOVATION',
  'SMART_HOME',
  'DESIGN_ENGINEERING',
]);
const CONSULTATION_SERVICE_TYPES = new Set(['PURCHASE_SALE_CONSULTATION', 'OTHER']);

type CaseStatusCategory = 'deed' | 'consultation' | 'construction';

function caseStatusCategoryOf(serviceType?: string): CaseStatusCategory {
  if (serviceType && CONSTRUCTION_SERVICE_TYPES.has(serviceType)) return 'construction';
  if (serviceType && CONSULTATION_SERVICE_TYPES.has(serviceType)) return 'consultation';
  return 'deed';
}

const CASE_STATUS_LABELS_BY_CATEGORY: Record<CaseStatusCategory, Record<string, string>> = {
  deed: {
    SUBMITTED: 'ثبت اولیه درخواست',
    DOCUMENT_REVIEW: 'بررسی و تأیید مدارک',
    AGENCY_FOLLOW_UP: 'پیگیری اداری و ثبتی',
    COMPLETED: 'صدور و تحویل سند',
    FAILED: 'عدم تأیید پرونده',
  },
  consultation: {
    SUBMITTED: 'ثبت اولیه درخواست',
    DOCUMENT_REVIEW: 'بررسی اولیه درخواست',
    AGENCY_FOLLOW_UP: 'در حال مذاکره و پیگیری',
    COMPLETED: 'نتیجه حاصل شد',
    FAILED: 'بدون نتیجه بسته شد',
  },
  construction: {
    SUBMITTED: 'ثبت اولیه درخواست',
    DOCUMENT_REVIEW: 'بررسی و برآورد اولیه',
    AGENCY_FOLLOW_UP: 'در حال اجرای پروژه',
    COMPLETED: 'تکمیل و تحویل پروژه',
    FAILED: 'پروژه لغو شد',
  },
};

export function caseStatusLabel(status: string, serviceType?: string): string {
  const category = caseStatusCategoryOf(serviceType);
  return CASE_STATUS_LABELS_BY_CATEGORY[category][status] ?? status;
}
