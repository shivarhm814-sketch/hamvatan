import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <i className="ph ph-map-trifold text-4xl text-muted" />
      <h1 className="text-xl font-bold text-ink">صفحه مورد نظر پیدا نشد</h1>
      <p className="max-w-md text-muted">صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است.</p>
      <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:opacity-90">
        بازگشت به خانه
      </Link>
    </div>
  );
}
