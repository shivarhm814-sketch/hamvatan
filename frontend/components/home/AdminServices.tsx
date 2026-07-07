import Link from 'next/link';
import { AccentHeader } from '@/components/ui/AccentHeader';
import { ADMIN_SERVICES } from '@/lib/constants';

export function AdminServices() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary">
          <i className="ph-fill ph-sparkle text-secondary" />
          خدمتی نو برای شما
        </span>
        <AccentHeader title="خدمات اداری و ثبتی" subtitle="پیگیری کامل پرونده‌های ثبتی شما تا صدور سند نهایی" />
        <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {ADMIN_SERVICES.map((service) => (
            <div key={service.title} className="rounded-xl border border-line p-5 text-center">
              <span className="mx-auto mb-3 flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-soft text-2xl text-primary">
                <i className={`ph ${service.icon}`} />
              </span>
              <h4 className="text-sm font-bold text-ink">{service.title}</h4>
            </div>
          ))}
        </div>
        <Link
          href="/services/request"
          className="mx-auto flex w-fit items-center gap-2 rounded-full bg-secondary px-6 py-3 font-bold text-[#3a2f00] transition hover:opacity-90"
        >
          <i className="ph ph-paper-plane-tilt" />
          درخواست بررسی رایگان مدارک
        </Link>
      </div>
    </section>
  );
}
