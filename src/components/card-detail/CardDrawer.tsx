"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiApplication, ApiApplicationDetail } from "@/lib/api-client";
import { CardTabs } from "./CardTabs";

const SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  WORKDAY: "Workday",
  INDEED: "Indeed",
  OTHER: "Web",
  MANUAL: "Added manually",
};

type DraftFields = Pick<
  ApiApplication,
  | "roleTitle"
  | "companyName"
  | "location"
  | "salaryRange"
  | "notes"
  | "nextAction"
  | "nextActionDate"
  | "originalUrl"
>;

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function CardDrawer({
  card,
  isOpen,
  onClose,
}: {
  card: ApiApplication | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftFields | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch full detail (contacts + activities) when drawer opens.
  // While a TL;DR is still generating in the background (job
  // description present, headline not written yet), poll every 2.5s
  // so the summary fills in live; stop as soon as it lands.
  const detailQuery = useQuery({
    queryKey: ["application", card?.id],
    queryFn: () =>
      card ? api.getApplicationDetail(card.id).then((r) => r.application) : Promise.reject(),
    enabled: !!card && isOpen,
    refetchInterval: (query) => {
      const d = query.state.data;
      return d && d.jobDescription && !d.tldrHeadline ? 2500 : false;
    },
  });

  useEffect(() => {
    if (card) {
      setDraft({
        roleTitle: card.roleTitle,
        companyName: card.companyName,
        location: card.location,
        salaryRange: card.salaryRange,
        notes: card.notes,
        nextAction: card.nextAction,
        nextActionDate: card.nextActionDate,
        originalUrl: card.originalUrl,
      });
    } else {
      setDraft(null);
    }
  }, [card]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DraftFields>) =>
      card
        ? api.updateApplication(card.id, data)
        : Promise.reject(new Error("No card")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      if (card) queryClient.invalidateQueries({ queryKey: ["application", card.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't save changes.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      card ? api.deleteApplication(card.id) : Promise.reject(new Error("No card")),
    onSuccess: () => {
      toast.success("Card deleted.");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't delete card.");
    },
  });

  function updateField<K extends keyof DraftFields>(key: K, value: DraftFields[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateMutation.mutate({ [key]: value } as Partial<DraftFields>);
    }, 500);
  }

  if (!card || !draft) return null;

  const sourceLabel = card.sourcePlatform ? SOURCE_LABEL[card.sourcePlatform] : null;
  const detail = detailQuery.data;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        // Floating drawer: inset from the viewport edges, rounded
        // corners, soft elevation. `!` overrides the side= preset
        // from the shadcn Sheet primitive.
        className={[
          "!inset-y-3 !right-3 !h-[calc(100vh-1.5rem)]",
          "!w-[min(640px,calc(100vw-1.5rem))] sm:!max-w-[640px]",
          "rounded-xl border bg-popover shadow-2xl",
          "p-0 gap-0 flex flex-col overflow-hidden",
        ].join(" ")}
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b space-y-2.5">
          <SheetTitle className="sr-only">{card.roleTitle}</SheetTitle>
          <SheetDescription className="sr-only">{card.companyName}</SheetDescription>

          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-role">Role</Label>
                  {card.matchScore != null && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                      Job Match Score: {card.matchScore}
                    </span>
                  )}
                </div>
                <Input
                  id="card-role"
                  value={draft.roleTitle}
                  onChange={(e) => updateField("roleTitle", e.target.value)}
                  className="text-[15px] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="card-company">Company</Label>
                <Input
                  id="card-company"
                  value={draft.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              </div>
            </div>
            {card.companyLogoUrl && (
              <div className="pt-6 pr-2 shrink-0">
                <img 
                  src={card.companyLogoUrl} 
                  alt={card.companyName} 
                  className="w-16 h-16 rounded-md object-contain border bg-background shadow-sm" 
                />
              </div>
            )}
          </div>
        </SheetHeader>

        <CardTabs
          card={card}
          detail={detail}
          draft={draft}
          updateField={
            updateField as unknown as (key: string, value: unknown) => void
          }
        />

        <div className="px-5 py-3 border-t flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-muted-foreground">
            {updateMutation.isPending ? "Saving…" : "Saved"}
          </span>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirm("Delete this card? You can restore it within 30 days.")) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
