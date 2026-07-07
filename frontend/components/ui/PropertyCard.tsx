import Link from 'next/link';
import type { Property } from '@/types';
import { dealTypeLabel, formatPriceToman, formatTotalFromPricePerSqm, propertyTypeLabel, toFa } from '@/lib/utils';

const DEAL_BADGE_STYLES: Record<string, string> = {
  SALE: 'bg-sale',
  RENT: 'bg-rent',
};

const PER_SQM_TYPES = ['LAND', 'PADDY_FIELD'];

export function PropertyCard({ property }: { property: Property }) {
  const priceUnit = property.dealType === 'RENT' ? 'تومان / ماهانه' : 'تومان';
  const coverImage = property.images[0];
  const isPerSqm = PER_SQM_TYPES.includes(property.type);
  const totalPrice = isPerSqm ? formatTotalFromPricePerSqm(property.price, property.areaSqm) : null;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition hover:-translate-y-1 hover:shadow-[0_28px_55px_-30px_rgba(0,0,0,0.42)]"
    >
      <div className="relative flex aspect-[16/11] items-center justify-center bg-[repeating-linear-gradient(45deg,#e6ebef,#e6ebef_12px,#eef3f6_12px,#eef3f6_24px)]">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage.url} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <span className="font-mono text-xs text-muted">PROPERTY PHOTO</span>
        )}
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold text-white ${DEAL_BADGE_STYLES[property.dealType]}`}
        >
          {dealTypeLabel(property.dealType)}
        </span>
        {property.hasSingleDeed && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-sale">
            <i className="ph-fill ph-seal-check" />
            تک‌برگ
          </span>
        )}
      </div>

      <div className="p-[18px]">
        <h3 className="mb-2 text-lg font-bold text-ink">{property.title}</h3>
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[13.5px] text-muted">
          <span className="flex items-center gap-1">
            <i className="ph ph-map-pin" />
            {property.city}
          </span>
          {property.areaSqm && (
            <span className="flex items-center gap-1">
              <i className="ph ph-ruler" />
              {toFa(property.areaSqm)} متر
            </span>
          )}
          <span className="flex items-center gap-1">
            <i className="ph ph-house" />
            {propertyTypeLabel(property.type)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-line pt-3">
          <div>
            {isPerSqm ? (
              <>
                <span className="text-[20px] font-extrabold text-primary">{formatPriceToman(property.price)}</span>
                <span className="mr-1 text-xs text-muted">تومان / متر</span>
                {totalPrice && <p className="mt-0.5 text-xs text-muted">قیمت کل: {totalPrice} تومان</p>}
              </>
            ) : (
              <>
                <span className="text-[20px] font-extrabold text-primary">{formatPriceToman(property.price)}</span>
                <span className="mr-1 text-xs text-muted">{priceUnit}</span>
              </>
            )}
          </div>
          <span className="text-sm font-bold text-secondary">جزئیات ←</span>
        </div>
      </div>
    </Link>
  );
}
