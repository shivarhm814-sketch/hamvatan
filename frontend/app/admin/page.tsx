'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDashboardSummary } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { DashboardSummary } from '@/types';
import { adminServiceTypeLabel, caseStatusLabel, toFa } from '@/lib/utils';

const STAT_CARDS = [
  { key: 'activeProperties', label: 'آگهی‌های فعال', icon: 'ph-buildings', color: 'text-primary', href: '/admin/properties' },
  { key: 'inProgressCases', label: 'پرونده‌های در جریان', icon: 'ph-folder-notch', color: 'text-secondary', href: '/admin/cases' },
  { key: 'unhandledContacts', label: 'پیام‌های پاسخ‌نداده', icon: 'ph-chats', color: 'text-error', href: '/admin/contacts' },
  { key: 'newUsersThisWeek', label: 'کاربران جدید این هفته', icon: 'ph-user-plus', color: 'text-sale', href: '/admin/users' },
] as const;

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    getDashboardSummary(token)
      .then(setSummary)
      .catch(() => setError('خطا در بارگذاری داشبورد.'));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">داشبورد</h1>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {!summary ? (
        <p className="text-muted">در حال بارگذاری...</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {STAT_CARDS.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className="rounded-xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-1"
              >
                <i className={`ph ${card.icon} text-2xl ${card.color}`} />
                <p className={`mt-3 text-3xl font-extrabold ${card.color}`}>{toFa(summary[card.key])}</p>
                <p className="mt-1 text-sm text-muted">{card.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
            <div className="rounded-xl border border-line bg-surface p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-ink">آخرین پرونده‌های اداری</h2>
                <Link href="/admin/cases" className="text-sm text-secondary">
                  مشاهده همه
                </Link>
              </div>
              {summary.recentCases.length === 0 ? (
                <p className="text-sm text-muted">پرونده‌ای ثبت نشده است.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {summary.recentCases.map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin/cases/${item.id}`}
                      className="flex items-center justify-between rounded-lg border border-line p-3 text-sm hover:bg-soft"
                    >
                      <div>
                        <p className="font-bold text-ink" dir="ltr">
                          {item.trackingCode}
                        </p>
                        <p className="text-muted">{adminServiceTypeLabel(item.serviceType)}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary">{caseStatusLabel(item.status)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-ink">آخرین پیام‌های تماس</h2>
                <Link href="/admin/contacts" className="text-sm text-secondary">
                  مشاهده همه
                </Link>
              </div>
              {summary.recentContacts.length === 0 ? (
                <p className="text-sm text-muted">پیامی ثبت نشده است.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {summary.recentContacts.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border border-line p-3 text-sm ${!item.isHandled ? 'bg-[rgba(212,172,13,0.06)]' : ''}`}
                    >
                      <p className={item.isHandled ? 'text-ink' : 'font-bold text-ink'}>{item.name}</p>
                      <p dir="ltr" className="text-left text-muted">
                        {item.mobile}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
