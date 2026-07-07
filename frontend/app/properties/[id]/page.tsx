import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiRequestError, getProperty } from '@/lib/api';
import { CONTACT } from '@/lib/constants';
import { dealTypeLabel, formatPriceToman, formatTotalFromPricePerSqm, propertyTypeLabel, toFa } from '@/lib/utils';
import { PropertyGallery } from '@/components/ui/PropertyGallery';

const PER_SQM_TYPES = ['LAND', 'PADDY_FIELD'];

interface PropertyDetailPageProps {
  params: { id: string };
}

async function fetchPropertyOrNotFound(id: string) {
  try {
    return await getProperty(id);
  } catch (error) {
    if (error instanceof ApiRequestError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  try {
    const property = await getProperty(params.id);
    return {
      title: property.title,
      description: property.description ?? `${propertyTypeLabel(property.type)} در ${property.city}`,
    };
  } catch {
    return { title: 'جزئیات آگهی' };
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const property = await fetchPropertyOrNotFound(params.id);
  const priceUnit = property.dealType === 'RENT' ? 'تومان / ماهانه' : 'تومان';
  const isPerSqm = PER_SQM_TYPES.includes(property.type);
  const totalPrice = isPerSqm ? formatTotalFromPricePerSqm(property.price, property.areaSqm) : null;
  const hasLocation = property.latitude !== null && property.longitude !== null;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
      <Link href="/properties" className="mb-6 inline-block text-sm font-semibold text-primary">
        → بازگشت به آگهی‌ها
      </Link>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-10">
        <div>
          <PropertyGallery images={property.images} dealType={property.dealType} />

          <h1 className="mb-2 mt-8 text-2xl font-extrabold text-ink">{property.title}</h1>
          <p className="mb-6 flex items-center gap-1 text-muted">
            <i className="ph ph-map-pin" />
            {property.city}
            {property.region && ` · ${property.region}`}
          </p>

          <div className="mb-8 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-line bg-white p-4 text-center">
              <p className="mb-1 text-xs text-muted">نوع ملک</p>
              <p className="font-bold text-ink">{propertyTypeLabel(property.type)}</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4 text-center">
              <p className="mb-1 text-xs text-muted">متراژ</p>
              <p className="font-bold text-ink">{property.areaSqm ? `${toFa(property.areaSqm)} متر` : '—'}</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4 text-center">
              <p className="mb-1 text-xs text-muted">وضعیت سند</p>
              <p className="font-bold text-ink">{property.hasSingleDeed ? 'تک‌برگ' : 'قولنامه‌ای'}</p>
            </div>
          </div>

          {property.description && (
            <>
              <h3 className="mb-3 text-lg font-bold text-ink">توضیحات ملک</h3>
              <p className="leading-[2.1] text-muted">{property.description}</p>
            </>
          )}

          {hasLocation && (
            <>
              <h3 className="mb-3 mt-8 text-lg font-bold text-ink">موقعیت روی نقشه</h3>
              <div className="overflow-hidden rounded-xl border border-line">
                <iframe
                  title="موقعیت ملک روی نقشه"
                  src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                  className="h-[320px] w-full"
                  loading="lazy"
                />
              </div>
              <a
                href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                <i className="ph ph-map-trifold" />
                مشاهده در Google Maps
              </a>
            </>
          )}
        </div>

        <div className="sticky top-[90px] rounded-xl border border-line bg-white p-6 shadow-soft">
          {isPerSqm ? (
            <>
              <p className="mb-1 text-sm text-muted">قیمت هر متر</p>
              <p className="mb-1 text-[30px] font-extrabold text-primary">
                {formatPriceToman(property.price)}
                <span className="mr-1 text-sm font-normal text-muted">تومان</span>
              </p>
              {totalPrice && <p className="mb-6 text-sm text-muted">قیمت کل: {totalPrice} تومان</p>}
            </>
          ) : (
            <>
              <p className="mb-1 text-sm text-muted">قیمت</p>
              <p className="mb-6 text-[30px] font-extrabold text-primary">
                {formatPriceToman(property.price)}
                <span className="mr-1 text-sm font-normal text-muted">{priceUnit}</span>
              </p>
            </>
          )}

          <a
            href={CONTACT.phoneHref}
            className="mb-3 flex items-center justify-center gap-2 rounded-[10px] bg-primary py-3 font-bold text-white transition hover:opacity-90"
          >
            <i className="ph ph-phone-call" />
            تماس با مشاور
          </a>
          <a
            href={CONTACT.whatsappHref}
            className="mb-3 flex items-center justify-center gap-2 rounded-[10px] bg-whatsapp py-3 font-bold text-white transition hover:opacity-90"
          >
            <i className="ph ph-whatsapp-logo" />
            پیام واتساپ
          </a>
          <Link
            href="/contact"
            className="mb-4 flex items-center justify-center gap-2 rounded-[10px] border border-primary py-3 font-bold text-primary transition hover:bg-soft"
          >
            ارسال پیام
          </Link>

          <p className="flex items-center gap-2 text-xs text-muted">
            <i className="ph ph-shield-check text-sale" />
            مشخصات این ملک راستی‌آزمایی شده است.
          </p>
        </div>
      </div>
    </div>
  );
}
