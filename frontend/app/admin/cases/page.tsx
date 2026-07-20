'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listAdminServiceRequests } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { AdminServiceRequest, CaseStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { adminServiceTypeLabel, toFa } from '@/lib/utils';

const STATUS_TABS: { value: CaseStatus | ''; label: string }[] = [
  { value: '', label: 'همه' },
  { value: 'SUBMITTED', label: 'ثبت اولیه' },
  { value: 'DOCUMENT_REVIEW', label: 'بررسی مدارک' },
  { value: 'AGENCY_FOLLOW_UP', label: 'پیگیری اداری' },
  { value: 'COMPLETED', label: 'تکمیل‌شده' },
  { value: 'FAILED', label: 'ناموفق' },
];

const SERVICE_TYPE_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  {
    label: 'خدمات اداری و ثبتی',
    options: [
      { value: 'SINGLE_DEED', label: 'اخذ سند تک‌برگ' },
      { value: 'OLD_DEED_CONVERSION', label: 'تبدیل سند قدیمی' },
      { value: 'SURVEY_SSBR', label: 'نقشه‌برداری SSBR' },
      { value: 'SUBDIVISION', label: 'تفکیک ملک' },
    ],
  },
  {
    label: 'ساخت و پیمانکاری',
    options: [
      { value: 'CONSTRUCTION_PARTNERSHIP', label: 'مشارکت در ساخت' },
      { value: 'CONSTRUCTION_CONTRACT', label: 'پیمانکاری ساخت' },
      { value: 'RENOVATION', label: 'بازسازی و نوسازی' },
      { value: 'SMART_HOME', label: 'خانه هوشمند' },
      { value: 'DESIGN_ENGINEERING', label: 'طراحی و نقشه‌کشی' },
    ],
  },
  {
    label: 'سایر',
    options: [
      { value: 'PURCHASE_SALE_CONSULTATION', label: 'مشاوره خرید یا فروش ملک' },
      { value: 'OTHER', label: 'سایر موارد' },
    ],
  },
];

const CONSTRUCTION_TYPES = new Set(
  SERVICE_TYPE_GROUPS.find((group) => group.label === 'ساخت و پیمانکاری')?.options.map((o) => o.value),
);

function isConstructionType(serviceType: string): boolean {
  return CONSTRUCTION_TYPES.has(serviceType);
}

function formatDate(iso: string): string {
  return toFa(new Date(iso).toLocaleDateString('fa-IR'));
}

export default function AdminCasesPage() {
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [serviceType, setServiceType] = useState('');
  const [cases, setCases] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('برای این عملیات باید وارد شوید.');
      setLoading(false);
      return;
    }
    setLoading(true);
    listAdminServiceRequests(token, status || undefined, serviceType || undefined)
      .then(setCases)
      .catch(() => setError('خطا در بارگذاری پرونده‌ها.'))
      .finally(() => setLoading(false));
  }, [status, serviceType]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">پرونده‌های خدمات اداری</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                status === tab.value ? 'bg-primary text-white' : 'bg-soft text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="h-11 min-w-[180px] rounded-[10px] border border-line bg-bg px-3 text-sm"
        >
          <option value="">همه انواع خدمات</option>
          {SERVICE_TYPE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {loading ? (
        <p className="text-muted">در حال بارگذاری...</p>
      ) : cases.length === 0 ? (
        <p className="text-muted">پرونده‌ای یافت نشد.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-right text-sm">
            <thead className="bg-soft text-muted">
              <tr>
                <th className="p-4">کد رهگیری</th>
                <th className="p-4">نوع خدمت</th>
                <th className="p-4">تاریخ ثبت</th>
                <th className="p-4">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="p-4">
                    <Link
                      href={`/admin/cases/${c.id}`}
                      dir="ltr"
                      className="font-mono text-xs font-bold text-primary hover:underline"
                    >
                      {c.trackingCode}
                    </Link>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const label = adminServiceTypeLabel(c.serviceType);
                      const showBadge = isConstructionType(c.serviceType) && !label.includes('ساخت');
                      return (
                        <>
                          {label}
                          {showBadge && (
                            <span className="mr-1.5 rounded-full border border-line bg-soft px-2 py-0.5 align-middle text-[11px] font-semibold text-primary">
                              ساخت
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </td>
                  <td className="p-4">{formatDate(c.createdAt)}</td>
                  <td className="p-4">
                    <StatusBadge status={c.status} serviceType={c.serviceType} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
