'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthToken } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/admin', label: 'داشبورد', icon: 'ph-squares-four' },
  { href: '/admin/properties', label: 'آگهی‌های ملکی', icon: 'ph-buildings' },
  { href: '/admin/cases', label: 'پرونده‌های خدمات اداری', icon: 'ph-folder-notch' },
  { href: '/admin/contacts', label: 'پیام‌های تماس', icon: 'ph-chats' },
  { href: '/admin/users', label: 'کاربران', icon: 'ph-users' },
  { href: '/admin/settings', label: 'تنظیمات', icon: 'ph-gear-six' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/hamvatan-icon.svg" alt="" width={40} height={40} className="h-10 w-10" />
            <span className="text-lg font-extrabold text-primary">پنل مدیریت هم‌وطن</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-soft"
          >
            <i className="ph ph-arrow-square-out" />
            مشاهده سایت
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1300px] gap-6 px-5 py-8">
        <aside className="hidden w-[220px] shrink-0 md:block">
          <div className="sticky top-24 rounded-xl border border-line bg-surface p-3 shadow-soft">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      active ? 'bg-primary text-white' : 'text-ink hover:bg-soft'
                    }`}
                  >
                    <i className={`ph ${item.icon} text-lg`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-2.5 rounded-lg border-t border-line px-3 pt-3 text-sm font-semibold text-error hover:bg-soft"
            >
              <i className="ph ph-sign-out text-lg" />
              خروج
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold ${
                    active ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink'
                  }`}
                >
                  <i className={`ph ${item.icon}`} />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-error px-3 py-2 text-xs font-bold text-error"
            >
              <i className="ph ph-sign-out" />
              خروج
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
