export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{eyebrow}</p>
      <h1 className="mt-2.5 text-balance font-display text-[32px] leading-[1.06] tracking-[-0.035em] text-ink sm:text-[36px]">
        {title}
      </h1>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}
