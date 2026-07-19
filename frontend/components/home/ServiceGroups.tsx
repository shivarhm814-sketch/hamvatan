import Link from 'next/link';

const GROUPS = [
  {
    href: '/properties',
    icon: 'ph-buildings',
    title: 'گروه املاک',
    desc: 'خرید و فروش خانه ویلایی، زمین، مغازه و آپارتمان با مشاوره تخصصی و آگهی‌های راستی‌آزمایی‌شده.',
  },
  {
    href: '/services/request',
    icon: 'ph-stamp',
    title: 'گروه خدمات اداری',
    desc: 'اخذ سند تک‌برگ، تبدیل سند قدیمی، نقشه‌برداری و تفکیک ملک؛ پیگیری کامل امور ثبتی تا صدور سند.',
  },
  {
    href: '/construction',
    icon: 'ph-hard-hat',
    title: 'گروه ساخت و پیمانکاری',
    desc: 'مشارکت در ساخت، پیمانکاری ویلا و ساختمان، بازسازی و نوسازی، خانه هوشمند و طراحی معماری.',
  },
];

export function ServiceGroups() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {GROUPS.map((group) => (
          <Link
            key={group.href}
            href={group.href}
            className="group rounded-xl border border-line bg-surface p-7 shadow-soft transition hover:-translate-y-1"
          >
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-3xl text-primary">
              <i className={`ph ${group.icon}`} />
            </span>
            <h3 className="mb-2 text-2xl font-bold text-ink">{group.title}</h3>
            <p className="mb-4 text-[15px] leading-8 text-muted">{group.desc}</p>
            <span className="font-bold text-secondary">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
