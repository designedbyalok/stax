import { AlertCircle, Sparkles } from "@/components/icons";
import { Label } from "@/components/ui/label";

export function ReviewField({
  label,
  children,
  required,
  uncertain,
  aiFilled,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  uncertain?: boolean;
  aiFilled?: boolean;
}) {
  return (
    <div className="space-y-1.5 mb-3">
      <div className="flex items-center gap-1.5">
        <Label className="text-[12px] font-medium text-muted-foreground">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </Label>
        {uncertain ? (
          <span
            title="We're not sure this is right"
            className="ml-auto inline-flex items-center gap-1 px-1.5 py-0 rounded-md text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <AlertCircle className="h-2.5 w-2.5" strokeWidth={2.2} />
            Verify
          </span>
        ) : aiFilled ? (
          <span
            title="Auto-filled from the posting"
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 dark:text-violet-300"
          >
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
            AI filled
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
