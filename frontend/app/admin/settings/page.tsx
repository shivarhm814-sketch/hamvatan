'use client';

import { useEffect, useState } from 'react';
import {
  getPublicSettings,
  getServiceStatus,
  getSmsTemplates,
  updateContactSettings,
  updateSmsTemplate,
} from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { CaseStatus, ContactSettings, ServiceStatus, SmsTemplates } from '@/types';
import { CASE_STATUS_LABELS_BY_CATEGORY, SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS_FA, ServiceCategory } from '@/lib/utils';

const CASE_STATUSES: CaseStatus[] = [
  'SUBMITTED',
  'DOCUMENT_REVIEW',
  'AGENCY_FOLLOW_UP',
  'COMPLETED',
  'FAILED',
];

const CONTACT_FIELDS: { key: keyof ContactSettings; label: string }[] = [
  { key: 'contact.phone', label: 'شماره تماس اصلی' },
  { key: 'contact.phoneSecondary', label: 'شماره تماس دوم' },
  { key: 'contact.whatsapp', label: 'شماره واتساپ' },
  { key: 'contact.address', label: 'آدرس' },
  { key: 'contact.workingHours', label: 'ساعات کاری' },
];

export default function AdminSettingsPage() {
  const [contact, setContact] = useState<ContactSettings | null>(null);
  const [templates, setTemplates] = useState<SmsTemplates | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [templateMessage, setTemplateMessage] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    getPublicSettings().then(setContact);
    getSmsTemplates(token).then(setTemplates);
    getServiceStatus(token).then(setServiceStatus);
  }, []);

  const handleSaveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token || !contact) return;
    setSavingContact(true);
    setContactMessage('');
    try {
      const formData = new FormData(e.currentTarget);
      const data: Partial<ContactSettings> = {};
      CONTACT_FIELDS.forEach((field) => {
        data[field.key] = String(formData.get(field.key) ?? '');
      });
      const updated = await updateContactSettings(token, data);
      setContact(updated as ContactSettings);
      setContactMessage('اطلاعات تماس ذخیره شد.');
    } catch {
      setContactMessage('خطا در ذخیره اطلاعات تماس.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveTemplate = async (category: ServiceCategory, status: CaseStatus, template: string) => {
    const token = getAuthToken();
    if (!token) return;
    const savingKey = `${category}.${status}`;
    setSavingStatus(savingKey);
    setTemplateMessage('');
    try {
      const updated = await updateSmsTemplate(token, status, category, template);
      setTemplates(updated);
      setTemplateMessage('پیام پیامک ذخیره شد.');
    } catch {
      setTemplateMessage('خطا در ذخیره پیام پیامک.');
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <div className="max-w-[800px]">
      <h1 className="mb-6 text-2xl font-extrabold text-ink">تنظیمات</h1>

      <section className="mb-8 rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold text-ink">اطلاعات مجموعه</h2>
        {!contact ? (
          <p className="text-muted">در حال بارگذاری...</p>
        ) : (
          <form onSubmit={handleSaveContact} className="flex flex-col gap-3">
            {CONTACT_FIELDS.map((field) => (
              <label key={field.key} className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                {field.label}
                <input
                  name={field.key}
                  type="text"
                  defaultValue={contact[field.key]}
                  dir={field.key === 'contact.address' ? 'rtl' : 'ltr'}
                  className="h-11 rounded-[10px] border border-line bg-bg px-3"
                />
              </label>
            ))}
            {contactMessage && <p className="text-sm text-sale">{contactMessage}</p>}
            <button
              type="submit"
              disabled={savingContact}
              className="w-fit rounded-[10px] bg-primary px-6 py-2.5 font-bold text-white disabled:opacity-60"
            >
              {savingContact ? 'در حال ذخیره...' : 'ذخیره اطلاعات تماس'}
            </button>
          </form>
        )}
      </section>

      <section className="mb-8 rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-1 font-bold text-ink">پیام‌های پیامکی هر وضعیت پرونده</h2>
        <p className="mb-4 text-xs text-muted">
          هر گروه خدمتی متن جداگانه دارد — چون مثلاً «صدور و تحویل سند» برای یک درخواست مشاوره یا پروژه‌ی ساخت
          معنی ندارد. از عبارت <span dir="ltr">{'{trackingCode}'}</span> برای درج کد رهگیری در متن پیامک استفاده کنید.
        </p>
        {!templates ? (
          <p className="text-muted">در حال بارگذاری...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {SERVICE_CATEGORIES.map((category) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-extrabold text-primary">{SERVICE_CATEGORY_LABELS_FA[category]}</h3>
                <div className="flex flex-col gap-4">
                  {CASE_STATUSES.map((status) => (
                    <TemplateEditor
                      key={`${category}-${status}`}
                      category={category}
                      status={status}
                      initialValue={templates[category][status]}
                      saving={savingStatus === `${category}.${status}`}
                      onSave={(value) => handleSaveTemplate(category, status, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {templateMessage && <p className="text-sm text-sale">{templateMessage}</p>}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold text-ink">وضعیت سرویس‌های جانبی</h2>
        {!serviceStatus ? (
          <p className="text-muted">در حال بارگذاری...</p>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-line p-3">
              <span>سرویس پیامک</span>
              <span className="font-bold text-ink">{serviceStatus.smsProvider}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line p-3">
              <span>فضای ذخیره‌سازی تصاویر</span>
              <span className={`font-bold ${serviceStatus.storageConfigured ? 'text-sale' : 'text-error'}`}>
                {serviceStatus.storageConfigured ? 'متصل' : 'تنظیم نشده'}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function TemplateEditor({
  category,
  status,
  initialValue,
  saving,
  onSave,
}: {
  category: ServiceCategory;
  status: CaseStatus;
  initialValue: string;
  saving: boolean;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="rounded-lg border border-line p-3">
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {CASE_STATUS_LABELS_BY_CATEGORY[category][status]}
      </label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        className="mb-2 w-full rounded-[10px] border border-line bg-bg p-3 text-sm"
      />
      <button
        type="button"
        onClick={() => onSave(value)}
        disabled={saving}
        className="rounded-full border border-primary px-4 py-1.5 text-xs font-bold text-primary disabled:opacity-60"
      >
        {saving ? 'در حال ذخیره...' : 'ذخیره این پیام'}
      </button>
    </div>
  );
}
