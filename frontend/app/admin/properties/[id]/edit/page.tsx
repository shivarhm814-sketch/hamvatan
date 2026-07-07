'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAdminProperty } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { PropertyForm } from '@/components/admin/PropertyForm';
import { PropertyImageManager } from '@/components/admin/PropertyImageManager';
import type { Property } from '@/types';

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    getAdminProperty(token, params.id)
      .then(setProperty)
      .catch(() => setError('آگهی مورد نظر یافت نشد.'));
  }, [params.id]);

  if (error) {
    return <p className="text-sm text-error">{error}</p>;
  }

  if (!property) {
    return <p className="text-muted">در حال بارگذاری...</p>;
  }

  return (
    <div className="grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-start gap-6">
      <div>
        <h1 className="mb-6 text-2xl font-extrabold text-ink">ویرایش آگهی</h1>
        <PropertyForm property={property} />
      </div>
      <PropertyImageManager propertyId={property.id} initialImages={property.images} />
    </div>
  );
}
