import { PropertyForm } from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div className="max-w-[720px]">
      <h1 className="mb-6 text-2xl font-extrabold text-ink">ثبت آگهی جدید</h1>
      <PropertyForm />
    </div>
  );
}
