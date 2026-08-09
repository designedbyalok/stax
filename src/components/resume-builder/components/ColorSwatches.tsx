import { Palette } from "@/components/icons";

// A row of preset color swatches plus a native picker for any custom color.
export function ColorSwatches({
  options,
  current,
  onSelect,
}: {
  options: { name: string; value: string }[];
  current: string;
  onSelect: (value: string) => void;
}) {
  const isPreset = options.some((o) => o.value.toLowerCase() === current.toLowerCase());
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {options.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onSelect(c.value)}
          className={`w-7 h-7 rounded-full border transition-all ${
            current.toLowerCase() === c.value.toLowerCase()
              ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110"
              : "border-border hover:scale-105 shadow-sm"
          }`}
          style={{ backgroundColor: c.value }}
          title={c.name}
          aria-label={c.name}
        />
      ))}
      <label
        className={`relative w-7 h-7 rounded-full overflow-hidden cursor-pointer grid place-items-center border ${
          isPreset
            ? "border-border"
            : "ring-2 ring-foreground ring-offset-1 ring-offset-background border-transparent"
        }`}
        title="Custom color"
        style={isPreset ? undefined : { backgroundColor: current }}
      >
        {isPreset && <Palette className="w-3.5 h-3.5 text-muted-foreground" />}
        <input
          type="color"
          value={current}
          onChange={(e) => onSelect(e.target.value)}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          aria-label="Custom color"
        />
      </label>
    </div>
  );
}
