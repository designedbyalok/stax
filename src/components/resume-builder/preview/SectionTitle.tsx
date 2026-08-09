export function SectionTitle({
  template,
  color,
  children,
}: {
  template: string;
  color: string;
  children: React.ReactNode;
}) {
  if (template === "minimal") {
    return (
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
        {children}
      </h2>
    );
  }
  if (template === "elegant") {
    return (
      <h2
        className="text-[11px] font-semibold uppercase tracking-[0.3em] border-b pb-2 mb-4"
        style={{ borderColor: color, color }}
      >
        {children}
      </h2>
    );
  }
  if (template === "compact") {
    return (
      <h2
        className="text-[11px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2"
        style={{ borderColor: color, color }}
      >
        {children}
      </h2>
    );
  }
  return (
    <h2
      className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4"
      style={{ borderColor: color, color }}
    >
      {children}
    </h2>
  );
}
