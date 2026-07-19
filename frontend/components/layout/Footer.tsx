import Link from 'next/link';
import { CONTACT, FOOTER_CONTACT_MESSENGERS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-footer text-[rgba(255,255,255,0.78)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8 px-5 py-12">
        <div>
          <div className="mb-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/hamvatan-icon-white.svg" alt="" width={44} height={44} className="h-11 w-11" />
            <span className="text-lg font-extrabold text-white">هم‌وطن</span>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-secondary" />
              پشتیبانی تا پایان کار
            </li>
            <li className="flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-secondary" />
              مشاوران متخصص
            </li>
            <li className="flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-secondary" />
              استعلام اولیه رایگان
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">دسترسی سریع</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/properties" className="w-fit hover:text-secondary">
              آگهی‌های ملکی
            </Link>
            <Link href="/services/request" className="w-fit hover:text-secondary">
              بررسی رایگان مدارک
            </Link>
            <Link href="/construction" className="w-fit hover:text-secondary">
              ساخت و پیمانکاری
            </Link>
            <Link href="/services/track" className="w-fit hover:text-secondary">
              پیگیری پرونده
            </Link>
            <Link href="/about" className="w-fit hover:text-secondary">
              درباره ما
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">تماس با ما</h4>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-2 hover:text-secondary"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-lg text-white">
                <i className="ph-fill ph-whatsapp-logo" />
              </span>
              واتساپ
            </a>
            {FOOTER_CONTACT_MESSENGERS.map((messenger) =>
              messenger.href ? (
                <a
                  key={messenger.name}
                  href={messenger.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 hover:text-secondary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={messenger.image}
                    alt={messenger.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                  {messenger.name}
                </a>
              ) : (
                <span
                  key={messenger.name}
                  title={`${messenger.name} — به‌زودی`}
                  className="flex w-fit cursor-default items-center gap-2 opacity-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={messenger.image}
                    alt={messenger.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                  {messenger.name}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-[rgba(255,255,255,0.6)]">
        © ۱۴۰۴ هم‌وطن — تمام حقوق محفوظ است.
      </div>
    </footer>
  );
}
