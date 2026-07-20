'use client';

import { useState } from 'react';
import { ApiRequestError, trackCase } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import type { AdminServiceRequest } from '@/types';
import { adminServiceTypeLabel } from '@/lib/utils';

export default function CaseTrackingPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminServiceRequest | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    if (!code.trim()) {
      setError('لطفاً کد رهگیری را وارد کنید.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await trackCase(code.trim().toUpperCase());
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'پرونده‌ای با این کد یافت نشد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 py-[clamp(44px,8vw,84px)]">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-3xl text-primary">
          <i className="ph ph-magnifying-glass" />
        </span>
        <h1 className="mb-1 text-2xl font-extrabold text-ink">پیگیری وضعیت پرونده</h1>
        <p className="text-sm text-muted" dir="ltr">
          کد نمونه: ES-1404-2231
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex flex-wrap justify-center gap-3">
        <input
          type="text"
          dir="ltr"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="کد رهگیری"
          className="h-12 w-64 rounded-[10px] border border-line bg-bg px-4 text-center tracking-widest focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 items-center gap-2 rounded-[10px] bg-primary px-6 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <i className="ph ph-magnifying-glass" />
          {loading ? 'در حال جستجو...' : 'جستجو'}
        </button>
      </form>

      {error && <p className="mb-6 text-center text-sm text-error">{error}</p>}

      {result && (
        <div className="rounded-xl border border-line bg-surface p-6 shadow-soft">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p dir="ltr" className="text-sm font-bold text-primary">
                {result.trackingCode}
              </p>
              <p className="text-sm text-muted">{adminServiceTypeLabel(result.serviceType)}</p>
            </div>
            <StatusBadge status={result.status} serviceType={result.serviceType} />
          </div>
          <Timeline status={result.status} history={result.statusHistory} serviceType={result.serviceType} />
        </div>
      )}
    </div>
  );
}
