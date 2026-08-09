import Image from "next/image";
import { MapPin, Sparkles, X } from "@/components/icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StageSelector } from "../StageSelector";
import { ReviewField } from "./ReviewField";
import {
  JOB_TYPE_OPTIONS,
  NONE,
  SOURCE_OPTIONS,
  type ReviewDraft,
  type ReviewMode,
} from "./types";

export type ReviewDetailsFormProps = {
  mode: ReviewMode;
  draft: ReviewDraft;
  onDraftChange: React.Dispatch<React.SetStateAction<ReviewDraft>>;
  sourcePlatform: string;
  onSourcePlatformChange: (value: string) => void;
  columnId: string;
  onColumnIdChange: (value: string) => void;
  companyLogoUrl?: string | null;
  uncertainFields: Set<string>;
  aiFilledFields: Set<string>;
  onClose: () => void;
};

export function ReviewDetailsForm({
  mode,
  draft,
  onDraftChange,
  sourcePlatform,
  onSourcePlatformChange,
  columnId,
  onColumnIdChange,
  companyLogoUrl,
  uncertainFields,
  aiFilledFields,
  onClose,
}: ReviewDetailsFormProps) {
  return (
    <div className="flex flex-col min-h-0 overflow-y-auto scroll-soft p-5">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-foreground">
            {mode === "paste" ? "Review the details" : "Add a job"}
          </h2>
          {mode === "paste" && (
            <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[11px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="w-6 h-6 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">
        {mode === "paste"
          ? "Pulled from the original posting. Fix anything that looks off."
          : "Fill in what you know — you can edit any of this later."}
      </p>

      {mode === "paste" && companyLogoUrl && (
        <div className="flex items-center gap-3 p-2.5 mb-3 bg-muted/40 rounded-lg">
          <Image
            src={companyLogoUrl}
            alt={draft.companyName}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-lg object-contain bg-white shrink-0 ring-1 ring-border"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground truncate">
              {draft.companyName || "Company"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">Logo auto-fetched</div>
          </div>
        </div>
      )}

      <ReviewField
        label="Role title"
        required
        uncertain={mode === "paste" && uncertainFields.has("roleTitle")}
        aiFilled={mode === "paste" && aiFilledFields.has("roleTitle")}
      >
        <Input
          value={draft.roleTitle}
          onChange={(e) => onDraftChange((d) => ({ ...d, roleTitle: e.target.value }))}
          placeholder="Senior Frontend Engineer"
        />
      </ReviewField>

      <div className="grid grid-cols-2 gap-3">
        <ReviewField
          label="Company"
          required
          uncertain={mode === "paste" && uncertainFields.has("companyName")}
          aiFilled={mode === "paste" && aiFilledFields.has("companyName")}
        >
          <Input
            className={cn(
              uncertainFields.has("companyName") &&
                "border-amber-400 bg-amber-50 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 dark:bg-amber-950/30"
            )}
            value={draft.companyName}
            onChange={(e) => onDraftChange((d) => ({ ...d, companyName: e.target.value }))}
            placeholder="Vercel"
          />
        </ReviewField>
        <ReviewField
          label="Source"
          aiFilled={mode === "paste" && aiFilledFields.has("sourcePlatform")}
        >
          <Select value={sourcePlatform} onValueChange={(v) => onSourcePlatformChange(v ?? "MANUAL")}>
            <SelectTrigger className="h-9 text-[13px]">
              <span className="truncate">
                {SOURCE_OPTIONS.find((o) => o.value === sourcePlatform)?.label ?? "Web"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ReviewField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ReviewField
          label="Location"
          uncertain={mode === "paste" && uncertainFields.has("location")}
          aiFilled={mode === "paste" && aiFilledFields.has("location")}
        >
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
              strokeWidth={1.8}
            />
            <Input
              value={draft.location}
              onChange={(e) => onDraftChange((d) => ({ ...d, location: e.target.value }))}
              placeholder="Add a location"
              className="pl-8"
            />
          </div>
        </ReviewField>
        <ReviewField
          label="Salary"
          uncertain={mode === "paste" && uncertainFields.has("salaryRange")}
          aiFilled={mode === "paste" && aiFilledFields.has("salaryRange")}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px] pointer-events-none">
              $
            </span>
            <Input
              value={draft.salaryRange}
              onChange={(e) => onDraftChange((d) => ({ ...d, salaryRange: e.target.value }))}
              placeholder="120k – 180k"
              className="pl-7"
            />
          </div>
        </ReviewField>
      </div>

      {mode === "manual" ? (
        <div className="grid grid-cols-2 gap-3">
          <ReviewField label="Employment">
            <Select
              value={draft.jobType || NONE}
              onValueChange={(v) =>
                onDraftChange((d) => ({
                  ...d,
                  jobType: (v === NONE ? "" : v) as ReviewDraft["jobType"],
                }))
              }
            >
              <SelectTrigger className="h-9 text-[13px]">
                <span className="truncate">
                  {JOB_TYPE_OPTIONS.find((o) => o.value === draft.jobType)?.label ?? "—"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value || NONE} value={o.value || NONE}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ReviewField>
          <ReviewField label="Job posting URL">
            <Input
              type="url"
              value={draft.originalUrl}
              onChange={(e) => onDraftChange((d) => ({ ...d, originalUrl: e.target.value }))}
              placeholder="https://…"
            />
          </ReviewField>
        </div>
      ) : (
        <ReviewField label="Employment" aiFilled={aiFilledFields.has("jobType")}>
          <Select
            value={draft.jobType}
            onValueChange={(v) =>
              onDraftChange((d) => ({
                ...d,
                jobType: v as ReviewDraft["jobType"],
              }))
            }
          >
            <SelectTrigger className="h-9 text-[13px]">
              <span className="truncate">
                {JOB_TYPE_OPTIONS.find((o) => o.value === draft.jobType)?.label ?? "—"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value || "none"} value={o.value || "none"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ReviewField>
      )}

      <ReviewField label="Add to column">
        <StageSelector value={columnId} onChange={onColumnIdChange} />
      </ReviewField>
    </div>
  );
}
