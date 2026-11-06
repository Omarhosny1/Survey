import { cn, initials } from "@/lib/utils";

const palettes = [
  { bg: "#E2EDE7", fg: "#0D5947" },
  { bg: "#FBE9DF", fg: "#B34A22" },
  { bg: "#F7EFD9", fg: "#8A6515" },
  { bg: "#E6EEF2", fg: "#3F6375" },
  { bg: "#ECE7DD", fg: "#6B5638" },
];

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return palettes[Math.abs(hash) % palettes.length] ?? palettes[0];
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-[9.5px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const palette = paletteFor(name || "SurveyLand");
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold tracking-wide ring-1 ring-black/5",
        sizes[size],
        className,
      )}
      style={src ? undefined : { backgroundColor: palette.bg, color: palette.fg }}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name || "SL")
      )}
    </span>
  );
}
