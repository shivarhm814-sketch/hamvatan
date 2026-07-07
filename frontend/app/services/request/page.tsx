'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ApiRequestError, submitAdminServiceRequest } from '@/lib/api';

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'SINGLE_DEED', label: 'اخذ سند تک‌برگ (املاک نسقی و سایر موارد)' },
  { value: 'OLD_DEED_CONVERSION', label: 'تبدیل اسناد قدیمی (دفترچه‌ای) به تک‌برگ' },
  { value: 'SURVEY_SSBR', label: 'نقشه‌برداری و اخذ کد SSBR' },
  { value: 'SUBDIVISION', label: 'تفکیک و صورت‌مجلس تفکیکی' },
  { value: 'PURCHASE_SALE_CONSULTATION', label: 'مشاوره خرید یا فروش ملک' },
  { value: 'OTHER', label: 'سایر موارد' },
];

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

function validateDocuments(files: File[]): string | null {
  if (files.length > MAX_FILES) {
    return `حداکثر ${MAX_FILES} فایل قابل آپلود است.`;
  }
  for (const file of files) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'فرمت‌های مجاز: JPG، PNG، PDF';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `حجم فایل «${file.name}» بیش از ۱۰ مگابایت است.`;
    }
  }
  return null;
}

export default function ServiceRequestPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const rawFormData = new FormData(e.currentTarget);
    // A <input type="file" multiple> with nothing selected still yields one empty File entry —
    // strip it out so an untouched optional field doesn't get rejected as an invalid upload.
    const documents = (rawFormData.getAll('documents') as File[]).filter((file) => file.size > 0);
    const documentValidationError = validateDocuments(documents);
    if (documentValidationError) {
      setError(documentValidationError);
      return;
    }

    const formData = new FormData();
    formData.set('contactMobile', String(rawFormData.get('contactMobile') ?? ''));
    formData.set('serviceType', String(rawFormData.get('serviceType') ?? ''));
    const notes = rawFormData.get('notes');
    if (notes) formData.set('notes', notes);
    documents.forEach((file) => formData.append('documents', file));

    setLoading(true);
    try {
      const result = await submitAdminServiceRequest(formData);
      setTrackingCode(result.trackingCode);
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'خطا در ثبت درخواست.');
    } finally {
      setLoading(false);
    }
  };

  if (trackingCode) {
    return (
      <div className="mx-auto flex max-w-[820px] flex-col items-center px-5 py-[clamp(44px,8vw,84px)] text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(30,142,90,0.12)] text-4xl text-sale">
          <i className="ph-fill ph-check-circle" />
        </span>
        <h1 className="mb-3 text-2xl font-extrabold text-ink">درخواست شما ثبت شد</h1>
        <p className="mb-6 max-w-md text-muted">
          کارشناسان ما در کمتر از ۲۴ ساعت کاری با شما تماس می‌گیرند. برای پیگیری، کد رهگیری زیر را نزد خود نگه دارید.
        </p>
        <div dir="ltr" className="mb-8 rounded-xl border-2 border-dashed border-line px-8 py-4 text-2xl font-bold tracking-wider text-primary">
          {trackingCode}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/services/track" className="rounded-full bg-primary px-6 py-3 font-bold text-white">
            پیگیری پرونده
          </Link>
          <Link href="/" className="rounded-full border border-primary px-6 py-3 font-bold text-primary">
            بازگشت به خانه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px] px-5 py-[clamp(44px,8vw,84px)]">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(30,142,90,0.12)] px-4 py-2 text-sm font-bold text-sale">
          <i className="ph ph-gift" />
          کاملاً رایگان و بدون تعهد
        </span>
        <h1 className="mb-2 text-2xl font-extrabold text-ink">بررسی اولیه رایگان مدارک</h1>
        <p className="max-w-lg text-muted">
          مدارک ملکی خود را برای ما ارسال کنید تا کارشناسان ما مسیر قانونی پرونده شما را رایگان بررسی کنند.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6 shadow-soft"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          شماره موبایل
          <input
            required
            name="contactMobile"
            type="tel"
            dir="ltr"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className="h-12 rounded-[10px] border border-line bg-bg px-4 text-lg focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          نوع خدمت
          <select
            required
            name="serviceType"
            defaultValue=""
            className="h-12 rounded-[10px] border border-line bg-bg px-4 focus:border-primary focus:outline-none"
          >
            <option value="" disabled>
              انتخاب کنید
            </option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          توضیحات
          <textarea
            name="notes"
            rows={4}
            className="rounded-[10px] border border-line bg-bg p-4 focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          آپلود مدارک
          <div className="flex flex-col items-center gap-2 rounded-[10px] border-2 border-dashed border-line p-6 text-center text-muted">
            <i className="ph ph-upload-simple text-2xl" />
            <input type="file" name="documents" multiple accept=".jpg,.jpeg,.png,.pdf" className="text-sm" />
            <span className="text-xs">فرمت‌های مجاز: JPG، PNG، PDF — حداکثر ۱۰ مگابایت</span>
          </div>
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-secondary py-3 font-bold text-[#3a2f00] transition hover:opacity-90 disabled:opacity-60"
        >
          <i className="ph ph-paper-plane-tilt" />
          {loading ? 'در حال ارسال...' : 'ارسال درخواست بررسی'}
        </button>
      </form>
    </div>
  );
}
