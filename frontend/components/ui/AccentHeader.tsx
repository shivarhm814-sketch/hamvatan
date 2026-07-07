interface AccentHeaderProps {
  title: string;
  subtitle?: string;
}

export function AccentHeader({ title, subtitle }: AccentHeaderProps) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <span className="mt-2 h-[26px] w-[6px] shrink-0 rounded-full bg-secondary" />
      <div>
        <h2 className="text-[clamp(24px,3.4vw,34px)] font-extrabold text-primary">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-[15px] text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
