import type { Metadata } from 'next';
import Link from 'next/link';
import { AccentHeader } from '@/components/ui/AccentHeader';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'ساخت و پیمانکاری',
  description:
    'مشارکت در ساخت، پیمانکاری ساخت ویلا و ساختمان، بازسازی و نوسازی، خانه هوشمند و طراحی '
    + 'معماری — زیر نظر مستقیم فرهاد اسماعیلی.',
};

const MAIN_SERVICES = [
  {
    icon: 'ph-handshake',
    title: 'مشارکت در ساخت',
    desc: 'سرمایه‌گذاری مشترک روی زمین شما. اجرا با ما، سود با هم.',
    value: 'CONSTRUCTION_PARTNERSHIP',
  },
  {
    icon: 'ph-buildings',
    title: 'پیمانکاری ساخت',
    desc: 'ساخت ویلا، مغازه و ساختمان از صفر تا تحویل — با بهترین متریال.',
    value: 'CONSTRUCTION_CONTRACT',
  },
  {
    icon: 'ph-paint-roller',
    title: 'بازسازی و نوسازی',
    desc: 'بازسازی و تغییرات ویلا و خانه‌های مسکونی با اجرای حرفه‌ای.',
    value: 'RENOVATION',
  },
  {
    icon: 'ph-wifi-high',
    title: 'ساخت خانه هوشمند',
    desc: 'طراحی و اجرای خانه هوشمند با سیستم‌های یکپارچه مدرن.',
    value: 'SMART_HOME',
  },
];

const SPECIALTIES = [
  { icon: 'ph-tree', label: 'نجاری' },
  { icon: 'ph-wrench', label: 'حلب‌کاری' },
  { icon: 'ph-hammer', label: 'آهنگری' },
  { icon: 'ph-git-branch', label: 'سربندی (آهن/آلومینیوم)' },
  { icon: 'ph-wall', label: 'بنایی' },
  { icon: 'ph-link', label: 'آرماتوربندی' },
  { icon: 'ph-drop', label: 'لوله‌کشی' },
  { icon: 'ph-paint-bucket', label: 'گچ‌کاری' },
  { icon: 'ph-lightning', label: 'برق‌کاری' },
  { icon: 'ph-squares-four', label: 'کاشی‌کاری' },
  { icon: 'ph-palette', label: 'نقاشی ساختمان' },
  { icon: 'ph-archive-box', label: 'کابینت' },
];

const DESIGN_ITEMS = [
  'طراحی پلان معماری',
  'نقشه‌کشی سازه و تأسیسات',
  'سبک سوئیسی و مدرن',
  'اخذ پروانه ساخت',
  'نظارت مهندسی در اجرا',
];

export default function ConstructionPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative mx-auto max-w-[760px] px-5 py-[clamp(44px,7vw,84px)] text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-sm font-bold text-[#3a2f00]">
            با نظارت مستقیم فرهاد اسماعیلی
          </span>
          <h1 className="mb-5 text-[clamp(26px,4vw,46px)] font-extrabold leading-tight">
            ساخت و پیمانکاری حرفه‌ای
          </h1>
          <p className="mx-auto mb-7 max-w-lg text-[17px] leading-[1.8] text-white/82">
            از طراحی و نقشه‌کشی تا تحویل کلید — با بهترین مهندسان، طراحان و استادکاران خبره استان گیلان.
          </p>
          <Link
            href="/services/request?type=CONSTRUCTION_CONTRACT"
            className="mx-auto flex h-[60px] w-fit items-center gap-2 rounded-[18px] bg-secondary px-6 font-bold text-[#3a2f00] shadow-[0_18px_40px_-20px_rgba(212,172,13,0.7)] transition hover:opacity-90"
          >
            <i className="ph ph-phone-call text-xl" />
            مشاوره رایگان ساخت
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
        <AccentHeader title="خدمات ساخت و پیمانکاری" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {MAIN_SERVICES.map((s) => (
            <Link
              key={s.value}
              href={`/services/request?type=${s.value}`}
              className="group rounded-xl border border-line bg-surface p-7 shadow-soft transition hover:-translate-y-1"
            >
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-soft text-3xl text-primary">
                <i className={`ph ${s.icon}`} />
              </span>
              <h3 className="mb-2 text-lg font-bold text-ink">{s.title}</h3>
              <p className="text-[14px] leading-7 text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-10 px-5 py-[clamp(44px,6vw,72px)]">
          <div>
            <AccentHeader title="طراحی و نقشه‌کشی" />
            <p className="mb-4 leading-8 text-muted">
              طراحی معماری، نقشه‌کشی سازه و اجرای ساختمان‌های سبک سوئیسی با همکاری بهترین طراحان و
              مهندسین برجسته استان.
            </p>
            <p className="mb-6 leading-8 text-muted">
              از ایده تا نقشه اجرایی، تمام مراحل طراحی زیر نظر مهندسین مجرب و با رعایت آخرین
              استانداردهای ساخت‌وساز انجام می‌شود.
            </p>
            <Link
              href="/services/request?type=DESIGN_ENGINEERING"
              className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-white"
            >
              درخواست مشاوره طراحی
            </Link>
          </div>
          <div className="rounded-xl border border-line bg-surface p-6 shadow-soft">
            {DESIGN_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 border-b border-line py-2.5 text-sm last:border-b-0"
              >
                <i className="ph-fill ph-check-circle text-lg text-sale" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)] text-center">
        <h2 className="mb-2 text-[clamp(20px,3vw,28px)] font-extrabold text-primary">تخصص‌های اجرایی</h2>
        <p className="mb-9 text-sm text-muted">
          با بهترین استادکاران در تمام رشته‌های ساختمانی در خدمت شما هستیم
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3.5">
          {SPECIALTIES.map((s) => (
            <div key={s.label} className="rounded-[10px] border border-line bg-surface p-4 shadow-soft">
              <i className={`ph ${s.icon} mb-2 block text-2xl text-primary`} />
              <span className="text-[13px] font-semibold text-ink">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-[clamp(32px,5vw,56px)] text-center text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative mx-auto max-w-2xl px-5">
          <i className="ph-fill ph-seal-check mb-4 block text-4xl text-secondary" />
          <h2 className="mb-3 text-[clamp(18px,3vw,26px)] font-extrabold leading-relaxed">
            کلیه امور پیمانکاری، ساخت، نقشه‌کشی و طراحی
            <br />
            زیر نظر مستقیم <span className="text-secondary">فرهاد اسماعیلی</span> انجام می‌شود
          </h2>
          <p className="mb-7 leading-8 text-white/85">
            ساخت و تعمیرات با نظارت شخصی ایشان صورت می‌گیرد. از اولین جلسه مشاوره تا لحظه تحویل
            کلید، همراه شما هستیم.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 font-bold text-white"
            >
              <i className="ph-fill ph-whatsapp-logo" />
              پیام واتساپ
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
