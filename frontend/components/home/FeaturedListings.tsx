import Link from 'next/link';
import { listProperties } from '@/lib/api';
import { AccentHeader } from '@/components/ui/AccentHeader';
import { PropertyCard } from '@/components/ui/PropertyCard';

export async function FeaturedListings() {
  const { items } = await listProperties({ limit: 4, page: 1 });

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <AccentHeader title="آگهی‌های ویژه" subtitle="نمونه‌ای از آگهی‌های راستی‌آزمایی‌شده هم‌وطن" />
        <Link
          href="/properties"
          className="h-fit rounded-full border border-primary px-5 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
        >
          مشاهده همه آگهی‌ها
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-6">
        {items.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
