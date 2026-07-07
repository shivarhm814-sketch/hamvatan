'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { requestOtp, verifyOtp, ApiRequestError } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'phone' | 'code' | 'success';

export function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep('phone');
    setMobile('');
    setCode('');
    setError('');
    setCanAccessAdmin(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(mobile, code);
      setAuthToken(result.accessToken);
      setCanAccessAdmin(result.user.role === 'ADMIN' || result.user.role === 'STAFF');
      setStep('success');
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'کد تأیید نادرست است.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,30,44,0.55)] backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="es-fade relative w-full max-w-[400px] rounded-[20px] bg-surface p-7 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="بستن"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-soft"
        >
          <i className="ph ph-x text-lg" />
        </button>

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-primary">
          <i className="ph-fill ph-user-circle text-3xl" />
        </div>

        <h2 className="mb-1 text-xl font-bold text-ink">ورود / ثبت‌نام</h2>

        {step === 'phone' && (
          <form onSubmit={handleRequestOtp}>
            <p className="mb-4 text-sm text-muted">با شماره موبایل خود وارد شوید</p>
            <input
              type="tel"
              dir="ltr"
              inputMode="numeric"
              autoFocus
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.trim())}
              className="mb-3 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-center text-lg focus:border-primary focus:outline-none"
            />
            {error && <p className="mb-3 text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] bg-primary py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyOtp}>
            <p className="mb-4 text-sm text-muted">کد تأیید ارسال‌شده به {mobile} را وارد کنید.</p>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              autoFocus
              placeholder="کد تأیید"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              className="mb-3 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-center text-lg tracking-widest focus:border-primary focus:outline-none"
            />
            {error && <p className="mb-3 text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] bg-secondary py-3 font-bold text-[#3a2f00] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'در حال بررسی...' : 'تأیید کد'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <>
            <p className="mb-4 flex items-center gap-2 text-sm text-[#1e8e5a]">
              <i className="ph-fill ph-check-circle text-xl" />
              با موفقیت وارد شدید.
            </p>
            {canAccessAdmin && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push('/admin/properties');
                }}
                className="mb-3 w-full rounded-[10px] bg-secondary py-3 font-bold text-[#3a2f00] transition hover:opacity-90"
              >
                ورود به پنل مدیریت
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-[10px] bg-primary py-3 font-bold text-white transition hover:opacity-90"
            >
              بستن
            </button>
          </>
        )}
      </div>
    </div>
  );
}
