import { cn } from "@/lib/utils";

// Company logo block. Falls back to the first letter of the name
// on a colored background. `tint` is the extracted dominant color
// (we already store this in Application.logoColor). Without a tint
// it reads from the local `--tint-strong` CSS variable, letting a
// parent with `data-stage=...` color it.
export function BrandAvatar({
  name,
  src,
  tint,
  size = 28,
  className,
}: {
  name: string;
  src?: string | null;
  tint?: string | null;
  size?: number;
  className?: string;
}) {
  const letter = (name?.trim()?.charAt(0) || "?").toUpperCase();
  return (
    <span
      className={cn(
        "grid place-items-center rounded-md text-white font-semibold shrink-0 overflow-hidden",
        className
      )}
      style={{
        width: size,
        height: size,
        background: tint ?? "var(--tint-strong, hsl(var(--muted-foreground)))",
        fontSize: Math.max(10, Math.round(size * 0.42)),
        letterSpacing: "-0.01em",
      }}
      aria-hidden
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-contain bg-white"
          loading="lazy"
          decoding="async"
        />
      ) : (
        letter
      )}
    </span>
  );
}
