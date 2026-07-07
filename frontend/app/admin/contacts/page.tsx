'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listContactRequests, markContactHandled } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { ContactRequest } from '@/types';
import { toFa } from '@/lib/utils';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('برای این عملیات باید وارد شوید.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listContactRequests(token);
      setContacts(data);
    } catch {
      setError('خطا در بارگذاری پیام‌ها.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkHandled = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const updated = await markContactHandled(token, id);
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      setError('خطا در به‌روزرسانی پیام.');
    }
  };

  return (
    <div className="max-w-[900px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">پیام‌های تماس</h1>
        <Link href="/admin/contacts/sms-log" className="text-sm font-bold text-primary hover:underline">
          لاگ پیامک‌ها ←
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {loading ? (
        <p className="text-muted">در حال بارگذاری...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-xl border p-5 ${contact.isHandled ? 'border-line bg-surface' : 'border-secondary bg-soft'}`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className={contact.isHandled ? 'text-ink' : 'font-bold text-ink'}>{contact.name}</p>
                  <p dir="ltr" className="text-sm text-muted">
                    {toFa(contact.mobile)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/98${contact.mobile.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-whatsapp px-4 py-1.5 text-xs font-bold text-white"
                  >
                    <i className="ph-fill ph-whatsapp-logo" />
                    واتساپ
                  </a>
                  {!contact.isHandled && (
                    <button
                      type="button"
                      onClick={() => handleMarkHandled(contact.id)}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white"
                    >
                      پیگیری شد
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm leading-7 text-muted">{contact.message}</p>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-muted">پیامی ثبت نشده است.</p>}
        </div>
      )}
    </div>
  );
}
