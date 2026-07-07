'use client';

import { ProvinceCitySelect } from './ProvinceCitySelect';

interface PropertyFilterBarProps {
  type?: string;
  dealType?: string;
  province?: string;
  city?: string;
}

const labelClassName = 'flex flex-col gap-1.5 text-sm text-muted';
const selectClassName =
  'h-[47px] rounded-[10px] border border-line bg-bg px-3 focus:border-primary focus:outline-none disabled:opacity-60';

export function PropertyFilterBar({ type, dealType, province, city }: PropertyFilterBarProps) {
  return (
    <form
      method="GET"
      className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] items-end gap-4 rounded-xl border border-line bg-surface p-5 shadow-soft"
    >
      <label className={labelClassName}>
        نوع ملک
        <select
          name="type"
          defaultValue={type ?? ''}
          className="h-[47px] rounded-[10px] border border-line bg-bg px-3 focus:border-primary focus:outline-none"
        >
          <option value="">همه انواع</option>
          <option value="VILLA">ویلایی</option>
          <option value="LAND">زمین</option>
          <option value="SHOP">مغازه</option>
          <option value="APARTMENT">آپارتمان</option>
          <option value="PADDY_FIELD">بیجار (شالیزار)</option>
        </select>
      </label>

      <label className={labelClassName}>
        نوع معامله
        <select
          name="dealType"
          defaultValue={dealType ?? ''}
          className="h-[47px] rounded-[10px] border border-line bg-bg px-3 focus:border-primary focus:outline-none"
        >
          <option value="">خرید و اجاره</option>
          <option value="SALE">فروش</option>
          <option value="RENT">اجاره</option>
        </select>
      </label>

      <ProvinceCitySelect
        initialProvince={province}
        initialCity={city}
        labelClassName={labelClassName}
        selectClassName={selectClassName}
      />

      <button
        type="submit"
        className="flex h-[47px] items-center justify-center gap-2 rounded-[10px] bg-primary font-bold text-white transition hover:opacity-90"
      >
        <i className="ph ph-funnel" />
        اعمال فیلتر
      </button>
    </form>
  );
}
