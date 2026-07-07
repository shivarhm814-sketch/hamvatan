const ADVANTAGES = [
  {
    title: 'بررسی اولیه رایگان مدارک',
    desc: 'پیش از هر اقدامی، مدارک شما را بدون هیچ هزینه‌ای بررسی می‌کنیم.',
  },
  {
    title: 'ارزیابی کارشناسی پیش از شروع',
    desc: 'زمان، هزینه و مسیر قانونی پرونده را شفاف به شما اعلام می‌کنیم.',
  },
  {
    title: 'پیگیری صفر تا صد امور',
    desc: 'تمام مراحل اداری و ثبتی را تا صدور سند نهایی خودمان پیگیری می‌کنیم.',
  },
];

export function Advantages() {
  return (
    <section className="bg-soft">
      <div className="mx-auto max-w-[1200px] px-5 py-[clamp(44px,6vw,72px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {ADVANTAGES.map((item) => (
            <div key={item.title} className="rounded-xl bg-white p-6 shadow-soft">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(30,142,90,0.12)] text-xl text-sale">
                <i className="ph-fill ph-seal-check" />
              </span>
              <h4 className="mb-2 text-lg font-bold text-ink">{item.title}</h4>
              <p className="text-sm leading-7 text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
