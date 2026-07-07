'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiRequestError, createProperty, updateProperty } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { ProvinceCitySelect } from '@/components/ui/ProvinceCitySelect';
import type { Property } from '@/types';

const fieldLabelClassName = 'flex flex-col gap-1.5 text-sm font-semibold text-ink';
const fieldSelectClassName = 'h-12 rounded-[10px] border border-line bg-bg px-4';
const PER_SQM_TYPES = ['LAND', 'PADDY_FIELD'];

// Number inputs otherwise let the mouse wheel silently change the value while
// scrolling the page with the cursor resting over the field — blur on wheel to prevent that.
const blurOnWheel = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur();

interface PropertyFormProps {
  property?: Property;
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isEdit = Boolean(property);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [type, setType] = useState(property?.type ?? '');
  const [latitude, setLatitude] = useState(property?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(property?.longitude?.toString() ?? '');
  const isPerSqm = PER_SQM_TYPES.includes(type);
  const hasLocation = latitude.trim() !== '' && longitude.trim() !== '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    const token = getAuthToken();
    if (!token) {
      setError('برای این عملیات باید وارد شوید.');
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      type: formData.get('type'),
      dealType: formData.get('dealType'),
      price: Number(formData.get('price')),
      areaSqm: formData.get('areaSqm') ? Number(formData.get('areaSqm')) : undefined,
      province: formData.get('province') || undefined,
      city: formData.get('city'),
      region: formData.get('region') || undefined,
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : undefined,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : undefined,
      hasSingleDeed: formData.get('hasSingleDeed') === 'on',
      ...(isEdit ? { status: formData.get('status') } : {}),
    };

    try {
      if (isEdit && property) {
        await updateProperty(token, property.id, data);
        setSaved(true);
        router.refresh();
      } else {
        const created = await createProperty(token, data);
        router.push(`/admin/properties/${created.id}/edit`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.message) : 'خطا در ثبت آگهی.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6">
      <label className={fieldLabelClassName}>
        عنوان آگهی
        <input
          required
          name="title"
          type="text"
          defaultValue={property?.title}
          className="h-12 rounded-[10px] border border-line bg-bg px-4"
        />
      </label>

      <label className={fieldLabelClassName}>
        توضیحات
        <textarea
          name="description"
          rows={4}
          defaultValue={property?.description ?? ''}
          className="rounded-[10px] border border-line bg-bg p-4"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={fieldLabelClassName}>
          نوع ملک
          <select
            required
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={fieldSelectClassName}
          >
            <option value="" disabled>
              انتخاب کنید
            </option>
            <option value="VILLA">ویلایی</option>
            <option value="LAND">زمین</option>
            <option value="SHOP">مغازه</option>
            <option value="APARTMENT">آپارتمان</option>
            <option value="PADDY_FIELD">بیجار (شالیزار)</option>
          </select>
        </label>
        <label className={fieldLabelClassName}>
          نوع معامله
          <select
            required
            name="dealType"
            defaultValue={property?.dealType ?? ''}
            className={fieldSelectClassName}
          >
            <option value="" disabled>
              انتخاب کنید
            </option>
            <option value="SALE">فروش</option>
            <option value="RENT">اجاره</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className={fieldLabelClassName}>
          {isPerSqm ? 'قیمت هر متر (تومان)' : 'قیمت (تومان)'}
          <input
            required
            name="price"
            type="number"
            min={0}
            onWheel={blurOnWheel}
            defaultValue={property?.price}
            className="h-12 rounded-[10px] border border-line bg-bg px-4"
          />
        </label>
        <label className={fieldLabelClassName}>
          متراژ (متر)
          <input
            name="areaSqm"
            type="number"
            min={0}
            onWheel={blurOnWheel}
            defaultValue={property?.areaSqm ?? ''}
            className="h-12 rounded-[10px] border border-line bg-bg px-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProvinceCitySelect
          required
          initialProvince={property?.province ?? undefined}
          initialCity={property?.city}
          labelClassName={fieldLabelClassName}
          selectClassName={fieldSelectClassName}
        />
      </div>

      <label className={fieldLabelClassName}>
        منطقه
        <input
          name="region"
          type="text"
          defaultValue={property?.region ?? ''}
          className="h-12 rounded-[10px] border border-line bg-bg px-4"
        />
      </label>

      <div className="rounded-[10px] border border-line p-4">
        <p className="mb-3 text-sm font-semibold text-ink">
          لوکیشن روی نقشه (اختیاری)
          <span className="mr-1 text-xs font-normal text-muted">
            — مختصات را از Google Maps (کلیک راست روی نقطه) کپی کنید
          </span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <label className={fieldLabelClassName}>
            عرض جغرافیایی (Latitude)
            <input
              name="latitude"
              type="number"
              step="any"
              value={latitude}
              onWheel={blurOnWheel}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="مثلاً 36.5659"
              className="h-12 rounded-[10px] border border-line bg-bg px-4"
            />
          </label>
          <label className={fieldLabelClassName}>
            طول جغرافیایی (Longitude)
            <input
              name="longitude"
              type="number"
              step="any"
              value={longitude}
              onWheel={blurOnWheel}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="مثلاً 50.8305"
              className="h-12 rounded-[10px] border border-line bg-bg px-4"
            />
          </label>
        </div>
        {hasLocation && (
          <div className="mt-3 overflow-hidden rounded-[10px] border border-line">
            <iframe
              title="پیش‌نمایش موقعیت روی نقشه"
              src={`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`}
              className="h-[220px] w-full"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {isEdit && (
        <label className={fieldLabelClassName}>
          وضعیت آگهی
          <select name="status" defaultValue={property?.status} className={fieldSelectClassName}>
            <option value="ACTIVE">فعال</option>
            <option value="SOLD">فروخته‌شده</option>
            <option value="ARCHIVED">آرشیو</option>
          </select>
        </label>
      )}

      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input name="hasSingleDeed" type="checkbox" defaultChecked={property?.hasSingleDeed} className="h-4 w-4" />
        دارای سند تک‌برگ
      </label>

      {saved && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#1e8e5a]">
          <i className="ph-fill ph-check-circle text-lg" />
          با موفقیت ذخیره شد
        </p>
      )}
      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-[10px] bg-primary py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'در حال ثبت...' : isEdit ? 'ذخیره تغییرات' : 'ثبت آگهی و افزودن تصاویر'}
      </button>
    </form>
  );
}
