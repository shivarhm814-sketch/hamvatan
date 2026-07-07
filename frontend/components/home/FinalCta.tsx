export function FinalCta() {
  return (
    <section className="bg-primary py-[clamp(44px,6vw,72px)] text-center text-white">
      <div className="mx-auto max-w-2xl px-5">
        <i className="ph ph-scroll mb-4 text-4xl text-secondary" />
        <h2 className="mb-3 text-[clamp(24px,3.4vw,34px)] font-extrabold">
          زمین بدون سند داری و نمی‌دونی از کجا شروع کنی؟
        </h2>
        <p className="mb-7 text-white/85">
          کارشناسان ما مدارک شما را رایگان بررسی می‌کنند و مسیر قانونی پرونده را روشن می‌کنند.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/services/request"
            className="flex items-center gap-2 rounded-full bg-secondary px-6 py-3 font-bold text-[#3a2f00] transition hover:opacity-90"
          >
            <i className="ph ph-chats-circle" />
            همین الان با ما مشورت کن
          </a>
        </div>
      </div>
    </section>
  );
}
