'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listSmsLogs, resendSms } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { MessageLog, MessageStatus } from '@/types';
import { toFa } from '@/lib/utils';

const STATUS_TABS: { value: MessageStatus | ''; label: string }[] = [
  { value: '', label: 'همه' },
  { value: 'PENDING', label: 'در صف' },
  { value: 'SENT', label: 'ارسال‌شده' },
  { value: 'FAILED', label: 'ناموفق' },
];

const STATUS_STYLES: Record<MessageStatus, string> = {
  PENDING: 'bg-[#F39C12] text-white',
  SENT: 'bg-sale text-white',
  FAILED: 'bg-error text-white',
};

const STATUS_LABELS_FA: Record<MessageStatus, string> = {
  PENDING: 'در صف',
  SENT: 'ارسال‌شده',
  FAILED: 'ناموفق',
};

function formatDateTime(iso: string): string {
  return toFa(new Date(iso).toLocaleString('fa-IR'));
}

export default function SmsLogPage() {
  const [status, setStatus] = useState<MessageStatus | ''>('');
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const load = () => {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    listSmsLogs(token, status || undefined)
      .then(setLogs)
      .catch(() => setError('خطا در بارگذاری لاگ پیامک‌ها.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleResend = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    setResendingId(id);
    try {
      const updated = await resendSms(token, id);
      setLogs((prev) => prev.map((log) => (log.id === id ? updated : log)));
    } catch {
      setError('خطا در ارسال مجدد پیامک.');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="max-w-[900px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">لاگ پیامک‌ها</h1>
        <Link href="/admin/contacts" className="text-sm font-bold text-primary hover:underline">
          → پیام‌های تماس
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
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

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {loading ? (
        <p className="text-muted">در حال بارگذاری...</p>
      ) : logs.length === 0 ? (
        <p className="text-muted">پیامکی ثبت نشده است.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-right text-sm">
            <thead className="bg-soft text-muted">
              <tr>
                <th className="p-4">شماره</th>
                <th className="p-4">متن پیامک</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">تاریخ</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-line align-top">
                  <td dir="ltr" className="p-4 text-left">
                    {log.mobile}
                  </td>
                  <td className="max-w-[280px] p-4 text-muted">{log.message}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[log.status]}`}>
                      {STATUS_LABELS_FA[log.status]}
                    </span>
                    {log.status === 'FAILED' && log.error && (
                      <p className="mt-1 text-xs text-error">{log.error}</p>
                    )}
                  </td>
                  <td className="p-4 text-muted">{formatDateTime(log.createdAt)}</td>
                  <td className="p-4">
                    {log.status === 'FAILED' && (
                      <button
                        type="button"
                        onClick={() => handleResend(log.id)}
                        disabled={resendingId === log.id}
                        className="rounded-full border border-primary px-4 py-1.5 text-xs font-bold text-primary disabled:opacity-60"
                      >
                        {resendingId === log.id ? 'در حال ارسال...' : 'ارسال مجدد'}
                      </button>
                    )}
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
