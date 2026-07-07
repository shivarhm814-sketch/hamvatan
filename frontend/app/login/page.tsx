'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiRequestError, requestOtp, verifyOtp } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';

type Step = 'phone' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setError('');
    if (!/^09\d{9}$/.test(mobile)) {
      setError('شماره موبایل معتبر نیست.');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(mobile);
      setStep('code');
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'خطا در ارسال کد تأیید.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(mobile, code);
      setAuthToken(result.accessToken);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'کد تأیید نادرست است.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center px-5 py-[clamp(44px,8vw,84px)]">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-3xl text-primary">
        <i className="ph-fill ph-user-circle" />
      </span>
      <h1 className="mb-1 text-2xl font-extrabold text-ink">ورود / ثبت‌نام</h1>
      <p className="mb-6 text-sm text-muted">با شماره موبایل خود وارد شوید</p>

      <div className="w-full rounded-xl border border-line bg-surface p-6 shadow-soft">
        {step === 'phone' ? (
          <>
            <input
              type="tel"
              dir="ltr"
              inputMode="numeric"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.trim())}
              className="mb-3 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-center text-lg focus:border-primary focus:outline-none"
            />
            {error && <p className="mb-3 text-sm text-error">{error}</p>}
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full rounded-[10px] bg-primary py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              placeholder="کد تأیید"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              className="mb-3 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-center text-lg tracking-widest focus:border-primary focus:outline-none"
            />
            {error && <p className="mb-3 text-sm text-error">{error}</p>}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full rounded-[10px] bg-secondary py-3 font-bold text-[#3a2f00] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'در حال بررسی...' : 'تأیید کد'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
