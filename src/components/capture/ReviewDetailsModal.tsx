"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, MapPin, Sparkles, X } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { StageSelector } from "./StageSelector";
import { LiveCardPreview } from "./LiveCardPreview";

// ─────────────────────────────────────────────────────────────
// Shared "Review the details" modal — two-column layout with
// a live preview, used by both the paste flow (PreviewCard) and
// the manual flow (ManualEntryForm).
//
// In `paste` mode it shows AI-filled badges + "Verify" warnings
// for uncertain fields and surfaces the source URL in the footer.
// In `manual` mode the AI affordances disappear and the URL
// becomes an optional input field.
// ─────────────────────────────────────────────────────────────

export type ReviewDraft = {
  roleTitle: string;
  companyName: string;
  location: string;
  salaryRange: string;
  jobType: "" | "FULL_TIME" | "CONTRACT" | "INTERNSHIP" | "PART_TIME" | "OTHER";
  originalUrl: string;
};

export type ReviewMode = "paste" | "manual";

export type ReviewDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ReviewMode;
  /** Initial form values. Re-applied whenever the modal opens. */
  initialDraft: Partial<ReviewDraft>;
  /** Field names that AI was uncertain about (paste mode only). */
  uncertainFields?: string[];
  /** Field names that came pre-filled from AI (paste mode only). */
  aiFilledFields?: string[];
  /** Source platform (LINKEDIN / etc) — paste mode. */
  source?: string;
  /** Company logo URL extracted from the post (paste mode). */
  companyLogoUrl?: string | null;
  /** Job description from the parser — saved but not edited here. */
  jobDescription?: string | null;
  isPending: boolean;
  onSave: (data: {
    draft: ReviewDraft;
    columnId: string;
    companyLogoUrl: string | null;
    jobDescription: string | null;
  }) => void;
};

const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "GREENHOUSE", label: "Greenhouse" },
  { value: "LEVER", label: "Lever" },
  { value: "WORKDAY", label: "Workday" },
  { value: "INDEED", label: "Indeed" },
  { value: "OTHER", label: "Web" },
  { value: "MANUAL", label: "Manual entry" },
];

// Sentinel sent through the Select primitive in place of an empty
// string, since some shadcn/base-ui Select implementations refuse
// to accept value="" on a SelectItem.
const NONE = "__none__";

const JOB_TYPE_OPTIONS: { value: ReviewDraft["jobType"]; label: string }[] = [
  { value: "", label: "—" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "OTHER", label: "Other" },
];

export function ReviewDetailsModal({
  open,
  onOpenChange,
  mode,
  initialDraft,
  uncertainFields = [],
  aiFilledFields = [],
  source,
  companyLogoUrl,
  jobDescription,
  isPending,
  onSave,
}: ReviewDetailsModalProps) {
  const uncertain = new Set(uncertainFields);
  const aiFilled = new Set(aiFilledFields);

  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const visibleColumns = (columnsQuery.data ?? []).filter((c) => !c.isArchive);

  const [draft, setDraft] = useState<ReviewDraft>(() => normalizeDraft(initialDraft));
  const [columnId, setColumnId] = useState<string>("");
  const [sourcePlatform, setSourcePlatform] = useState<string>(source ?? "MANUAL");

  // Reset when the modal opens fresh.
  useEffect(() => {
    if (!open) return;
    setDraft(normalizeDraft(initialDraft));
    setColumnId(visibleColumns[0]?.id ?? "");
    setSourcePlatform(source ?? (mode === "manual" ? "MANUAL" : "OTHER"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cmd+Enter to save.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        attemptSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft, columnId, sourcePlatform]);

  function attemptSave() {
    if (!draft.roleTitle.trim() || !draft.companyName.trim()) return;
    onSave({
      draft,
      columnId,
      companyLogoUrl: companyLogoUrl ?? null,
      jobDescription: jobDescription ?? null,
    });
  }

  const selectedColumnName =
    visibleColumns.find((c) => c.id === columnId)?.name ?? null;

  const urlForFooter = mode === "paste" ? draft.originalUrl : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "!w-[min(760px,calc(100vw-2rem))] sm:!max-w-[760px]",
          "!p-0 !gap-0 max-h-[calc(100vh-2rem)]",
          "rounded-2xl border bg-card shadow-2xl overflow-hidden",
          "grid grid-cols-1 md:grid-cols-[1.15fr_1fr] grid-rows-[1fr_auto]"
        )}
      >
        <DialogTitle className="sr-only">
          {mode === "paste" ? "Review the details" : "Add a job"}
        </DialogTitle>

        {/* LEFT — form */}
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
              onClick={() => onOpenChange(false)}
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

          {/* Logo row — only when we have a logo */}
          {mode === "paste" && companyLogoUrl && (
            <div className="flex items-center gap-3 p-2.5 mb-3 bg-muted/40 rounded-lg">
              <img
                src={companyLogoUrl}
                alt={draft.companyName}
                className="w-10 h-10 rounded-lg object-contain bg-white shrink-0 ring-1 ring-border"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">
                  {draft.companyName || "Company"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  Logo auto-fetched
                </div>
              </div>
            </div>
          )}

          {/* Role title */}
          <Field
            label="Role title"
            required
            uncertain={mode === "paste" && uncertain.has("roleTitle")}
            aiFilled={mode === "paste" && aiFilled.has("roleTitle")}
          >
            <Input
              value={draft.roleTitle}
              onChange={(e) =>
                setDraft((d) => ({ ...d, roleTitle: e.target.value }))
              }
              placeholder="Senior Frontend Engineer"
            />
          </Field>

          {/* Company + Source */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Company"
              required
              uncertain={mode === "paste" && uncertain.has("companyName")}
              aiFilled={mode === "paste" && aiFilled.has("companyName")}
            >
              <Input
                className={cn(
                  uncertain.has("companyName") &&
                    "border-amber-400 bg-amber-50 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 dark:bg-amber-950/30"
                )}
                value={draft.companyName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, companyName: e.target.value }))
                }
                placeholder="Vercel"
              />
            </Field>
            <Field
              label="Source"
              aiFilled={mode === "paste" && aiFilled.has("sourcePlatform")}
            >
              <Select
                value={sourcePlatform}
                onValueChange={(v) => setSourcePlatform(v ?? "MANUAL")}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <span className="truncate">
                    {SOURCE_OPTIONS.find((o) => o.value === sourcePlatform)
                      ?.label ?? "Web"}
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
            </Field>
          </div>

          {/* Location + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Location"
              uncertain={mode === "paste" && uncertain.has("location")}
              aiFilled={mode === "paste" && aiFilled.has("location")}
            >
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                  strokeWidth={1.8}
                />
                <Input
                  value={draft.location}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, location: e.target.value }))
                  }
                  placeholder="Add a location"
                  className="pl-8"
                />
              </div>
            </Field>
            <Field
              label="Salary"
              uncertain={mode === "paste" && uncertain.has("salaryRange")}
              aiFilled={mode === "paste" && aiFilled.has("salaryRange")}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px] pointer-events-none">
                  $
                </span>
                <Input
                  value={draft.salaryRange}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, salaryRange: e.target.value }))
                  }
                  placeholder="120k – 180k"
                  className="pl-7"
                />
              </div>
            </Field>
          </div>

          {/* Employment (job type) + URL (manual only) or Job Type alone (paste) */}
          {mode === "manual" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employment">
                <Select
                  value={draft.jobType || NONE}
                  onValueChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      jobType: (v === NONE ? "" : v) as ReviewDraft["jobType"],
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <span className="truncate">
                      {JOB_TYPE_OPTIONS.find(
                        (o) => o.value === draft.jobType
                      )?.label ?? "—"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPE_OPTIONS.map((o) => (
                      <SelectItem
                        key={o.value || NONE}
                        value={o.value || NONE}
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Job posting URL">
                <Input
                  type="url"
                  value={draft.originalUrl}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, originalUrl: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </Field>
            </div>
          ) : (
            <Field
              label="Employment"
              aiFilled={aiFilled.has("jobType")}
            >
              <Select
                value={draft.jobType}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    jobType: v as ReviewDraft["jobType"],
                  }))
                }
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <span className="truncate">
                    {JOB_TYPE_OPTIONS.find((o) => o.value === draft.jobType)
                      ?.label ?? "—"}
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
            </Field>
          )}

          {/* Stage selector */}
          <Field label="Add to column">
            <StageSelector value={columnId} onChange={setColumnId} />
          </Field>
        </div>

        {/* RIGHT — live preview */}
        <div className="hidden md:flex flex-col gap-3 p-[18px] bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))] border-l border-border overflow-y-auto scroll-soft">
          <LiveCardPreview
            roleTitle={draft.roleTitle}
            companyName={draft.companyName}
            companyLogoUrl={companyLogoUrl}
            location={draft.location.trim() || null}
            salaryRange={draft.salaryRange.trim() || null}
            jobType={draft.jobType || null}
            sourcePlatform={sourcePlatform}
            columnName={selectedColumnName}
          />

          {mode === "paste" && jobDescription && (
            <div className="rounded-[10px] bg-card border border-border p-3 text-[12px] space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                Also pulled · won't appear on the card
              </div>
              <p className="text-foreground/85 line-clamp-4 leading-relaxed">
                {jobDescription.slice(0, 280)}
                {jobDescription.length > 280 ? "…" : ""}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER (spans full width) */}
        <div className="col-span-full flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/30">
          {urlForFooter ? (
            <a
              href={urlForFooter}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground hover:underline min-w-0 max-w-[55%] truncate"
              title={urlForFooter}
            >
              <span className="truncate">{urlForFooter}</span>
            </a>
          ) : (
            <span className="text-[12px] text-muted-foreground">
              {mode === "manual" ? "No source URL" : ""}
            </span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={attemptSave}
              disabled={
                isPending || !draft.roleTitle.trim() || !draft.companyName.trim()
              }
              className="gap-2"
            >
              {isPending
                ? "Saving…"
                : mode === "paste"
                  ? "Save to pipeline"
                  : "Add job"}
              <span className="opacity-60 text-[11px] font-medium tracking-wider">
                ⌘↵
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Field({
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

function normalizeDraft(d: Partial<ReviewDraft>): ReviewDraft {
  return {
    roleTitle: d.roleTitle ?? "",
    companyName: d.companyName ?? "",
    location: d.location ?? "",
    salaryRange: d.salaryRange ?? "",
    jobType: (d.jobType ?? "") as ReviewDraft["jobType"],
    originalUrl: d.originalUrl ?? "",
  };
}
