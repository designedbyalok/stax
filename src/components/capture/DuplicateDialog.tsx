"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCaptureStore } from "./capture-store";

export function DuplicateDialog({
  onOpenExisting,
}: {
  onOpenExisting: (id: string) => void;
}) {
  const state = useCaptureStore((s) => s.state);
  const cancel = useCaptureStore((s) => s.cancel);
  const saveAsNew = useCaptureStore((s) => s.saveAsNewFromDuplicate);

  if (state.kind !== "duplicate") return null;
  const dup = state.duplicate;
  const when = formatDistanceToNow(new Date(dup.createdAt), { addSuffix: true });

  return (
    <Dialog open onOpenChange={(o) => !o && cancel()}>
      <DialogContent className="!flex !flex-col p-0 gap-0 overflow-hidden !w-[min(440px,calc(100vw-2rem))] !max-w-[440px]">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-sm font-medium">
            Looks like you saved this already
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            You saved this role {when}.
          </p>
          <div className="bg-muted/40 border rounded-md px-3 py-2.5">
            <div className="text-[13px] font-medium">{dup.roleTitle}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {dup.companyName}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={cancel}>
            Cancel
          </Button>
          <Button size="sm" variant="outline" onClick={saveAsNew}>
            Save as new
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onOpenExisting(dup.id);
              cancel();
            }}
          >
            Open existing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
