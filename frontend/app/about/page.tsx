import type { Metadata } from 'next';
import Image from 'next/image';
import { AccentHeader } from '@/components/ui/AccentHeader';
import { ADMIN_SERVICES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'درباره ما',
  description: 'آشنایی با هم‌وطن و مدیریت فرهاد اسماعیلی، فعال در حوزه املاک و خدمات ثبتی.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
      <AccentHeader title="درباره ما" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-soft">
          <Image
            src="/images/farhad-esmaeili.jpg"
            alt="فرهاد اسماعیلی، مدیر مجموعه هم‌وطن"
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="mb-4 leading-8 text-muted">
            هم‌وطن با سال‌ها تجربه در حوزه املاک و امور ثبتی، در دو بخش خرید و فروش/اجاره ملک و
            خدمات اداری و ثبتی فعالیت می‌کند. هدف ما ساده‌سازی مسیر پیچیده اداری برای مشتریان و ایجاد
            اطمینان کامل در هر معامله است.
          </p>
          <p className="mb-6 leading-8 text-muted">
            مدیریت مجموعه بر عهده <strong className="text-ink">فرهاد اسماعیلی</strong> است که با تیمی
            متخصص، تمام مراحل پرونده‌های ثبتی مشتریان را از ابتدا تا صدور سند نهایی پیگیری می‌کند.
          </p>

          <div className="mb-8 rounded-lg border-r-4 border-secondary bg-soft p-5">
            <p className="mb-1 font-bold text-primary">تمایز اصلی ما</p>
            <p className="text-sm text-muted">
              پیش از هر اقدام، مدارک شما را کاملاً رایگان بررسی می‌کنیم تا مسیر قانونی پرونده روشن شود.
            </p>
          </div>

          <h3 className="mb-4 text-lg font-bold text-ink">خدمات ما</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            {ADMIN_SERVICES.map((service) => (
              <div key={service.title} className="flex items-center gap-3 rounded-lg border border-line p-3">
                <i className={`ph ${service.icon} text-xl text-primary`} />
                <span className="text-sm font-semibold text-ink">{service.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
