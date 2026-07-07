'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CONTACT, NAV_LINKS } from '@/lib/constants';
import { LoginModal } from '@/components/ui/LoginModal';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center gap-[18px] px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/hamvatan-icon.svg" alt="" width={46} height={46} className="h-[46px] w-[46px]" />
            <span className="flex flex-col">
              <span className="text-[21px] font-extrabold text-primary">هم‌وطن</span>
              <span className="text-[11px] text-muted">املاک و خدمات ثبتی</span>
            </span>
          </Link>

          <nav className="mr-auto hidden items-center gap-[18px] md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 text-[15px] font-semibold text-ink transition hover:text-primary ${
                    active ? 'text-primary' : ''
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[1px] mx-auto h-[3px] w-6 rounded-full bg-secondary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-full border-[1.5px] border-primary px-5 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              ورود
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <a
              href={CONTACT.phoneHref}
              aria-label="تماس"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-primary"
            >
              <i className="ph ph-phone-call text-lg" />
            </a>
            <button
              type="button"
              aria-label="منو"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
            >
              <i className="ph ph-list text-lg" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-white md:hidden">
            <nav className="flex flex-col p-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3.5 text-[15px] font-semibold text-ink hover:bg-soft"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setLoginOpen(true);
                }}
                className="mt-2 rounded-[10px] bg-primary py-3 text-center font-bold text-white"
              >
                ورود / ثبت‌نام
              </button>
            </nav>
          </div>
        )}
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
