'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { archiveProperty, listAdminProperties } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { Property, PropertyStatus } from '@/types';
import { dealTypeLabel, formatPriceToman, propertyTypeLabel } from '@/lib/utils';
import { citiesOfProvince, IRAN_PROVINCES } from '@/lib/iran-locations';

const STATUS_TABS: { value: PropertyStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'فعال' },
  { value: 'SOLD', label: 'فروخته‌شده' },
  { value: 'ARCHIVED', label: 'آرشیو' },
];

export default function AdminPropertiesPage() {
  const [status, setStatus] = useState<PropertyStatus>('ACTIVE');
  const [type, setType] = useState('');
  const [dealType, setDealType] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cities = province ? citiesOfProvince(province) : [];

  const load = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const { items } = await listAdminProperties(token, { status, type, dealType, province, city, limit: 50 });
      setProperties(items);
    } catch {
      setError('خطا در بارگذاری آگهی‌ها.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleArchive = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    if (!confirm('این آگهی آرشیو شود؟')) return;
    try {
      await archiveProperty(token, id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('خطا در آرشیو کردن آگهی.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">مدیریت آگهی‌ها</h1>
        <Link href="/admin/properties/new" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">
          + آگهی جدید
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 rounded-xl border border-line bg-surface p-4"
      >
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 rounded-[10px] border border-line bg-bg px-3">
          <option value="">همه انواع</option>
          <option value="VILLA">ویلایی</option>
          <option value="LAND">زمین</option>
          <option value="SHOP">مغازه</option>
          <option value="APARTMENT">آپارتمان</option>
          <option value="PADDY_FIELD">بیجار (شالیزار)</option>
        </select>
        <select value={dealType} onChange={(e) => setDealType(e.target.value)} className="h-11 rounded-[10px] border border-line bg-bg px-3">
          <option value="">خرید و اجاره</option>
          <option value="SALE">فروش</option>
          <option value="RENT">اجاره</option>
        </select>
        <select
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setCity('');
          }}
          className="h-11 rounded-[10px] border border-line bg-bg px-3"
        >
          <option value="">همه استان‌ها</option>
          {IRAN_PROVINCES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!province}
          className="h-11 rounded-[10px] border border-line bg-bg px-3 disabled:opacity-60"
        >
          <option value="">{province ? `همه شهرهای ${province}` : 'ابتدا استان را انتخاب کنید'}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="h-11 rounded-[10px] bg-primary font-bold text-white">
          اعمال فیلتر
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {loading ? (
        <p className="text-muted">در حال بارگذاری...</p>
      ) : properties.length === 0 ? (
        <p className="text-muted">آگهی‌ای با این مشخصات یافت نشد.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-right text-sm">
            <thead className="bg-soft text-muted">
              <tr>
                <th className="p-4">تصویر</th>
                <th className="p-4">عنوان</th>
                <th className="p-4">شهر</th>
                <th className="p-4">نوع</th>
                <th className="p-4">معامله</th>
                <th className="p-4">قیمت</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-t border-line">
                  <td className="p-4">
                    {property.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={property.images[0].url}
                        alt=""
                        className="h-12 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-16 items-center justify-center rounded-md bg-soft text-muted">
                        <i className="ph ph-image" />
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-ink">{property.title}</td>
                  <td className="p-4">{property.city}</td>
                  <td className="p-4">{propertyTypeLabel(property.type)}</td>
                  <td className="p-4">{dealTypeLabel(property.dealType)}</td>
                  <td className="p-4">{formatPriceToman(property.price)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="rounded-full border border-primary px-4 py-1.5 text-xs font-bold text-primary"
                      >
                        ویرایش
                      </Link>
                      {property.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => handleArchive(property.id)}
                          className="rounded-full border border-error px-4 py-1.5 text-xs font-bold text-error"
                        >
                          آرشیو
                        </button>
                      )}
                    </div>
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
