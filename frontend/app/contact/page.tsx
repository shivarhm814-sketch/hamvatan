'use client';

import { useState } from 'react';
import { AccentHeader } from '@/components/ui/AccentHeader';
import { ApiRequestError, submitContactRequest } from '@/lib/api';
import { CONTACT } from '@/lib/constants';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      mobile: (form.elements.namedItem('mobile') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    try {
      await submitContactRequest(data);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'خطا در ارسال پیام.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
      <AccentHeader title="تماس با ما" subtitle="برای مشاوره رایگان با ما در تماس باشید" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-8">
        <div className="flex flex-col gap-4">
          <a
            href={CONTACT.whatsappHref}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(37,211,102,0.12)] text-2xl text-whatsapp">
              <i className="ph ph-whatsapp-logo" />
            </span>
            <span dir="ltr" className="font-bold text-ink">
              {CONTACT.whatsappDisplay}
            </span>
          </a>

          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-2xl text-primary">
              <i className="ph ph-clock" />
            </span>
            <span className="font-bold text-ink">{CONTACT.workingHours}</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-soft">
          {sent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(30,142,90,0.12)] text-3xl text-sale">
                <i className="ph-fill ph-check-circle" />
              </span>
              <p className="font-bold text-ink">پیام شما ارسال شد</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                نام و نام خانوادگی
                <input
                  required
                  name="name"
                  type="text"
                  className="h-12 rounded-[10px] border border-line bg-bg px-4 focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                شماره موبایل
                <input
                  required
                  name="mobile"
                  type="tel"
                  dir="ltr"
                  className="h-12 rounded-[10px] border border-line bg-bg px-4 focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                پیام
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="rounded-[10px] border border-line bg-bg p-4 focus:border-primary focus:outline-none"
                />
              </label>
              {error && <p className="text-sm text-error">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-[10px] bg-secondary py-3 font-bold text-[#3a2f00] transition hover:opacity-90 disabled:opacity-60"
              >
                <i className="ph ph-paper-plane-tilt" />
                {loading ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
