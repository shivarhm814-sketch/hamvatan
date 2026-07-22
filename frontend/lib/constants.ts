export const CONTACT = {
  phoneHref: 'tel:+989113308947',
  whatsappHref: 'https://wa.me/989903692519',
  manager: 'فرهاد اسماعیلی',
  workingHours: 'شنبه تا پنجشنبه، ۹ تا ۱۹',
  tagline: 'اعتماد شما، اعتبار ماست',
};

export interface Messenger {
  name: string;
  image: string;
  href?: string;
}

// پیام‌رسان‌های ستون «تماس با ما» در فوتر — جایگزین شماره تماس.
export const FOOTER_CONTACT_MESSENGERS: Messenger[] = [
  { name: 'بله', image: '/messengers/bale.jpg', href: 'https://ble.ir/Abc123' },
  { name: 'روبیکا', image: '/messengers/rubika.jpg', href: 'https://rubika.ir/Hehecfy' },
];

export const NAV_LINKS = [
  { href: '/', label: 'خانه' },
  { href: '/properties', label: 'آگهی‌های ملکی' },
  { href: '/services/request', label: 'بررسی رایگان مدارک' },
  { href: '/construction', label: 'ساخت و پیمانکاری' },
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
