import { cn } from "@/app/_lib/utils";

interface LogoProps {
  size?: number;
  tone?: "default" | "light" | "mark";
  className?: string;
}

export function Logo({ size = 32, tone = "default", className }: LogoProps) {
  const markBackground = tone === "light" ? "#fbf8f1" : "#0d5947";
  const lineColor = tone === "light" ? "#0d5947" : "#fbf8f1";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="1" y="1" width="34" height="34" rx="10.5" fill={markBackground} />
        <path
          d="M8 14.5c3.6 0 3.6-2.4 7.2-2.4s3.6 2.4 7.2 2.4 3.6-2.4 5.6-2.4"
          stroke={lineColor}
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M8 20c3.6 0 3.6-2.4 7.2-2.4s3.6 2.4 7.2 2.4 3.6-2.4 5.6-2.4"
          stroke={lineColor}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M8 25.5c3.6 0 3.6-2.4 7.2-2.4s3.6 2.4 7.2 2.4 3.6-2.4 5.6-2.4"
          stroke={lineColor}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.42"
        />
        <circle cx="27" cy="9.5" r="2.2" fill="#e4612d" />
      </svg>
      {tone !== "mark" && (
        <span
          className={cn(
            "font-display text-[20px] font-semibold tracking-[-0.035em]",
            tone === "light" ? "text-cream" : "text-ink",
          )}
        >
          Survey<span className={tone === "light" ? "text-cream/75" : "text-forest"}>Land</span>
        </span>
      )}
    </span>
  );
}
