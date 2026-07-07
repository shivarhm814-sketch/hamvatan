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
};

export function adminServiceTypeLabel(type: string): string {
  return ADMIN_SERVICE_TYPE_LABELS_FA[type] ?? type;
}

const CASE_STATUS_LABELS_FA: Record<string, string> = {
  SUBMITTED: 'ثبت اولیه درخواست',
  DOCUMENT_REVIEW: 'بررسی و تأیید مدارک',
  AGENCY_FOLLOW_UP: 'پیگیری اداری و ثبتی',
  COMPLETED: 'صدور و تحویل سند',
  FAILED: 'عدم تأیید پرونده',
};

export function caseStatusLabel(status: string): string {
  return CASE_STATUS_LABELS_FA[status] ?? status;
}
