import Image from 'next/image';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="bg-hero text-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-10 px-5 py-[clamp(44px,7vw,84px)]">
        <div className="es-fade">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-sm font-bold text-[#3a2f00]">
            ⭐ مشاوره اولیه رایگان
          </span>
          <h1 className="mb-5 text-[clamp(22px,3.6vw,42px)] font-extrabold leading-tight">
            از رویای خانه تا سند رسمی،
            <br />
            <span className="text-secondary">در کنار شما هستیم</span>
          </h1>
          <p className="mb-7 max-w-lg text-[21px] font-normal leading-[1.8] text-white/82">
            خرید، فروش و خدمات ثبتی ملک را از اولین استعلام تا صدور سند با همراهی کارشناسان هم‌وطن انجام دهید.
          </p>
          <div className="mb-6 flex flex-wrap gap-[20px]">
            <Link
              href="/properties"
              className="flex h-[60px] items-center gap-2 rounded-[18px] bg-white px-6 font-bold text-primary transition hover:opacity-90"
            >
              <i className="ph ph-buildings text-xl" />
              مشاهده آگهی‌های ملکی
            </Link>
            <Link
              href="/services/request"
              className="flex h-[60px] items-center gap-2 rounded-[18px] bg-secondary px-6 font-bold text-[#3a2f00] shadow-[0_18px_40px_-20px_rgba(212,172,13,0.7)] transition hover:opacity-90"
            >
              <i className="ph ph-file-magnifying-glass text-xl" />
              بررسی اولیه رایگان مدارک
            </Link>
          </div>
          <p className="text-sm text-white/70">«{CONTACT.tagline}»</p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 bg-white/5">
          <Image
            src="/images/hero-cabin.jpg"
            alt="ویلای چوبی هم‌وطن در دل طبیعت"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
