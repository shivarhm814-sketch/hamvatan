'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ApiRequestError,
  getCaseDetail,
  previewCaseSms,
  updateCaseInternalNotes,
  updateCaseStatus,
} from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { AdminServiceRequestDetail, CaseStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { adminServiceTypeLabel, caseStatusLabel, toFa } from '@/lib/utils';

const STATUS_OPTIONS: CaseStatus[] = [
  'SUBMITTED',
  'DOCUMENT_REVIEW',
  'AGENCY_FOLLOW_UP',
  'COMPLETED',
  'FAILED',
];

function formatDate(iso: string): string {
  return toFa(new Date(iso).toLocaleDateString('fa-IR'));
}

export default function AdminCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<AdminServiceRequestDetail | null>(null);
  const [error, setError] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>('SUBMITTED');
  const [note, setNote] = useState('');
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMessage, setNotesMessage] = useState('');

  const load = () => {
    const token = getAuthToken();
    if (!token) {
      setError('برای این عملیات باید وارد شوید.');
      return;
    }
    getCaseDetail(token, params.id)
      .then((data) => {
        setCaseData(data);
        setSelectedStatus(data.status);
        setInternalNotes(data.internalNotes ?? '');
      })
      .catch(() => setError('پرونده مورد نظر یافت نشد.'));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handlePreview = async () => {
    const token = getAuthToken();
    if (!token) return;
    setPreviewLoading(true);
    setStatusMessage('');
    try {
      const { message } = await previewCaseSms(token, params.id, selectedStatus);
      setPreviewMessage(message);
    } catch (err) {
      setStatusMessage(err instanceof ApiRequestError ? String(err.message) : 'خطا در ساخت پیش‌نمایش پیامک.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmStatus = async () => {
    const token = getAuthToken();
    if (!token) return;
    setSubmitting(true);
    setStatusMessage('');
    try {
      await updateCaseStatus(token, params.id, selectedStatus, note || undefined);
      setStatusMessage('وضعیت پرونده با موفقیت تغییر کرد و پیامک اطلاع‌رسانی ارسال شد.');
      setPreviewMessage(null);
      setNote('');
      load();
    } catch (err) {
      setStatusMessage(err instanceof ApiRequestError ? String(err.message) : 'خطا در تغییر وضعیت.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    const token = getAuthToken();
    if (!token) return;
    setSavingNotes(true);
    setNotesMessage('');
    try {
      await updateCaseInternalNotes(token, params.id, internalNotes);
      setNotesMessage('یادداشت داخلی ذخیره شد.');
    } catch {
      setNotesMessage('خطا در ذخیره یادداشت.');
    } finally {
      setSavingNotes(false);
    }
  };

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!caseData) return <p className="text-muted">در حال بارگذاری...</p>;

  return (
    <div className="max-w-[1000px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 dir="ltr" className="text-left text-2xl font-extrabold text-ink">
            {caseData.trackingCode}
          </h1>
          <p className="text-muted">{adminServiceTypeLabel(caseData.serviceType)}</p>
        </div>
        <StatusBadge status={caseData.status} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-bold text-ink">اطلاعات تماس مشتری</h2>
            <div className="flex items-center justify-between">
              <span dir="ltr" className="font-bold text-ink">
                {caseData.contactMobile}
              </span>
              <a
                href={`https://wa.me/98${caseData.contactMobile.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-whatsapp px-4 py-2 text-xs font-bold text-white"
              >
                <i className="ph-fill ph-whatsapp-logo" />
                واتساپ
              </a>
            </div>
            {caseData.notes && <p className="mt-3 text-sm text-muted">توضیحات مشتری: {caseData.notes}</p>}
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-bold text-ink">مدارک آپلودشده</h2>
            {caseData.documents.length === 0 ? (
              <p className="text-sm text-muted">مدرکی آپلود نشده است.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {caseData.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm hover:bg-soft"
                  >
                    <i className="ph ph-file-arrow-down text-primary" />
                    {doc.fileName}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-bold text-ink">تاریخچه وضعیت</h2>
            <Timeline status={caseData.status} history={caseData.statusHistory} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-bold text-ink">تغییر وضعیت پرونده</h2>
            <label className="mb-3 flex flex-col gap-1.5 text-sm font-semibold text-ink">
              وضعیت جدید
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as CaseStatus);
                  setPreviewMessage(null);
                }}
                className="h-11 rounded-[10px] border border-line bg-bg px-3"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {caseStatusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="mb-3 flex flex-col gap-1.5 text-sm font-semibold text-ink">
              یادداشت (نمایش داده می‌شود در تاریخچه)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="rounded-[10px] border border-line bg-bg p-3"
              />
            </label>

            {previewMessage ? (
              <div className="mb-3 rounded-lg bg-soft p-3 text-sm">
                <p className="mb-1 font-bold text-primary">متن پیامکی که ارسال می‌شود:</p>
                <p className="text-ink">{previewMessage}</p>
              </div>
            ) : null}

            {statusMessage && <p className="mb-3 text-sm text-error">{statusMessage}</p>}

            <div className="flex gap-2">
              {!previewMessage ? (
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  className="flex-1 rounded-[10px] border border-primary py-3 font-bold text-primary disabled:opacity-60"
                >
                  {previewLoading ? 'در حال آماده‌سازی...' : 'پیش‌نمایش پیامک'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmStatus}
                  disabled={submitting}
                  className="flex-1 rounded-[10px] bg-primary py-3 font-bold text-white disabled:opacity-60"
                >
                  {submitting ? 'در حال ثبت...' : 'تأیید و تغییر وضعیت'}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="mb-1 font-bold text-ink">یادداشت داخلی</h2>
            <p className="mb-3 text-xs text-muted">فقط کارکنان این یادداشت را می‌بینند؛ برای مشتری نمایش داده نمی‌شود.</p>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={4}
              placeholder="مثلاً: با دفتر ثبت هماهنگ شد."
              className="mb-3 w-full rounded-[10px] border border-line bg-bg p-3"
            />
            {notesMessage && <p className="mb-2 text-sm text-sale">{notesMessage}</p>}
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="w-full rounded-[10px] bg-secondary py-3 font-bold text-[#3a2f00] disabled:opacity-60"
            >
              {savingNotes ? 'در حال ذخیره...' : 'ذخیره یادداشت'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
