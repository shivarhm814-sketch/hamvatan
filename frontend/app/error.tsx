'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <i className="ph ph-warning-circle text-4xl text-error" />
      <h1 className="text-xl font-bold text-ink">مشکلی پیش آمد</h1>
      <p className="max-w-md text-muted">در بارگذاری این صفحه خطایی رخ داد. لطفاً دوباره تلاش کنید.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:opacity-90"
      >
        تلاش دوباره
      </button>
    </div>
  );
}
