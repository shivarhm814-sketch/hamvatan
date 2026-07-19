import type { Metadata } from 'next';
import '@phosphor-icons/web/regular/style.css';
import '@phosphor-icons/web/fill/style.css';
import './globals.css';
import { SiteChrome } from '@/components/layout/SiteChrome';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002'),
  title: {
    default: 'هم‌وطن | املاک و خدمات ثبتی',
    template: '%s | هم‌وطن',
  },
  description:
    'خرید و فروش ملک، خدمات اداری و ثبتی (اخذ سند تک‌برگ، تبدیل سند قدیمی، نقشه‌برداری و تفکیک) '
    + 'و ساخت و پیمانکاری (مشارکت در ساخت، بازسازی، طراحی و نقشه‌کشی) با بررسی رایگان مدارک.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="fa">
      <body className="font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
