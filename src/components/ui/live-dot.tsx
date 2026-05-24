// Pulsing green dot, used when a job posting is still live or a
// resource is freshly updated. The outer ring fades + scales via
// `app-live-pulse` keyframe defined in globals.css.
export function LiveDot({ title }: { title?: string }) {
  return (
    <span
      aria-hidden
      title={title}
      className="relative inline-block w-[5px] h-[5px] rounded-full bg-emerald-500 shrink-0"
    >
      <span
        className="absolute inset-[-2px] rounded-full bg-emerald-500 opacity-30"
        style={{ animation: "app-live-pulse 2.4s ease-out infinite" }}
      />
    </span>
  );
}
