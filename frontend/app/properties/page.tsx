import type { Metadata } from 'next';
import { listProperties } from '@/lib/api';
import { AccentHeader } from '@/components/ui/AccentHeader';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { PropertyFilterBar } from '@/components/ui/PropertyFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { toFa } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'آگهی‌های ملکی',
  description: 'خرید و فروش و اجاره ویلا، زمین، مغازه و آپارتمان با آگهی‌های راستی‌آزمایی‌شده.',
};

interface PropertiesPageProps {
  searchParams: {
    type?: string;
    dealType?: string;
    province?: string;
    city?: string;
    page?: string;
  };
}

const LIMIT = 9;

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { items, total } = await listProperties({
    type: searchParams.type,
    dealType: searchParams.dealType,
    province: searchParams.province,
    city: searchParams.city,
    page,
    limit: LIMIT,
  });
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (searchParams.type) params.set('type', searchParams.type);
    if (searchParams.dealType) params.set('dealType', searchParams.dealType);
    if (searchParams.province) params.set('province', searchParams.province);
    if (searchParams.city) params.set('city', searchParams.city);
    params.set('page', String(targetPage));
    return `/properties?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
      <AccentHeader title="آگهی‌های ملکی" subtitle={`${toFa(total)} ملک مطابق فیلتر شما`} />
      <PropertyFilterBar
        type={searchParams.type}
        dealType={searchParams.dealType}
        province={searchParams.province}
        city={searchParams.city}
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted">
          <i className="ph ph-magnifying-glass text-4xl" />
          <p>ملکی با این مشخصات پیدا نشد. فیلترها را تغییر دهید.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-6">
            {items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}
