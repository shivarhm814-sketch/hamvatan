export const CONTACT = {
  phoneDisplay: '۰۹۱۱ ۳۳۰ ۸۹۴۷',
  phoneHref: 'tel:+989113308947',
  phoneSecondaryDisplay: '۰۹۹۰ ۳۶۹ ۲۵۱۹',
  phoneSecondaryHref: 'tel:+989903692519',
  whatsappDisplay: '۰۹۹۰ ۳۶۹ ۲۵۱۹',
  whatsappHref: 'https://wa.me/989903692519',
  manager: 'فرهاد اسماعیلی',
  workingHours: 'شنبه تا پنجشنبه، ۹ تا ۱۹',
  tagline: 'اعتماد شما، اعتبار ماست',
};

export interface Messenger {
  name: string;
  icon: string;
  color: string;
  href?: string;
}

// ایتا و روبیکا فعلاً فقط آیکون دارند — به‌محض اینکه یوزرنیم/کانال مشخص شود، href پر می‌شود.
export const MESSENGERS: Messenger[] = [
  { name: 'واتساپ', icon: 'ph-whatsapp-logo', color: '#25D366', href: CONTACT.whatsappHref },
  { name: 'ایتا', icon: 'ph-paper-plane-tilt', color: '#00A99D' },
  { name: 'روبیکا', icon: 'ph-chat-circle-dots', color: '#8B3FA0' },
];

export const NAV_LINKS = [
  { href: '/', label: 'خانه' },
  { href: '/properties', label: 'آگهی‌های ملکی' },
  { href: '/services/request', label: 'بررسی رایگان مدارک' },
  { href: '/services/track', label: 'پیگیری پرونده' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس' },
];

export const ADMIN_SERVICES = [
  { title: 'اخذ سند تک‌برگ برای املاک نسقی و سایر املاک', icon: 'ph-certificate' },
  { title: 'تبدیل اسناد قدیمی (دفترچه‌ای) به تک‌برگ', icon: 'ph-arrows-clockwise' },
  { title: 'نقشه‌برداری و اخذ کد SSBR', icon: 'ph-map-trifold' },
  { title: 'تفکیک و صورت‌مجلس تفکیکی', icon: 'ph-squares-four' },
];
