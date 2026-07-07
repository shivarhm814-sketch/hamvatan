'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { citiesOfProvince, findProvinceByCity, IRAN_PROVINCES } from '@/lib/iran-locations';

interface ProvinceCitySelectProps {
  initialProvince?: string;
  initialCity?: string;
  required?: boolean;
  labelClassName: string;
  selectClassName: string;
}

function SearchableCombobox({
  label,
  name,
  value,
  onSelect,
  options,
  placeholder,
  allOptionLabel,
  disabled,
  required,
  labelClassName,
  inputClassName,
}: {
  label: string;
  name: string;
  value: string;
  onSelect: (value: string) => void;
  options: string[];
  placeholder: string;
  allOptionLabel: string;
  disabled?: boolean;
  required?: boolean;
  labelClassName: string;
  inputClassName: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filtered = useMemo(
    () => options.filter((option) => option.includes(query.trim())),
    [options, query],
  );

  const handleSelect = (option: string) => {
    onSelect(option);
    setQuery(option);
    setOpen(false);
  };

  return (
    <label className={labelClassName}>
      {label}
      <div ref={containerRef} className="relative">
        <input type="hidden" name={name} value={value} required={required} />
        <div className="relative">
          <i className="ph ph-magnifying-glass pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            disabled={disabled}
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (e.target.value === '') onSelect('');
            }}
            className={`${inputClassName} pr-9`}
            autoComplete="off"
          />
        </div>
        {open && !disabled && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[10px] border border-line bg-surface py-1 shadow-soft">
            {!required && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect('')}
                  className="block w-full px-4 py-2 text-right text-sm hover:bg-soft"
                >
                  {allOptionLabel}
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-muted">موردی یافت نشد</li>
            ) : (
              filtered.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    className="block w-full px-4 py-2 text-right text-sm hover:bg-soft"
                  >
                    {option}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </label>
  );
}

export function ProvinceCitySelect({
  initialProvince,
  initialCity,
  required = false,
  labelClassName,
  selectClassName,
}: ProvinceCitySelectProps) {
  const [province, setProvince] = useState(() => initialProvince ?? findProvinceByCity(initialCity) ?? '');
  const [city, setCity] = useState(initialCity ?? '');

  const cities = useMemo(() => citiesOfProvince(province), [province]);

  return (
    <>
      <SearchableCombobox
        label="استان"
        name="province"
        value={province}
        onSelect={(next) => {
          setProvince(next);
          setCity('');
        }}
        options={IRAN_PROVINCES.map((p) => p.name)}
        placeholder={required ? 'جستجوی استان...' : 'همه استان‌ها'}
        allOptionLabel="همه استان‌ها"
        required={required}
        labelClassName={labelClassName}
        inputClassName={selectClassName}
      />

      <SearchableCombobox
        label="شهر"
        name="city"
        value={city}
        onSelect={setCity}
        options={cities}
        placeholder={!province ? 'ابتدا استان را انتخاب کنید' : required ? 'جستجوی شهر...' : `همه شهرهای ${province}`}
        allOptionLabel={`همه شهرهای ${province}`}
        disabled={!province}
        required={required}
        labelClassName={labelClassName}
        inputClassName={selectClassName}
      />
    </>
  );
}
