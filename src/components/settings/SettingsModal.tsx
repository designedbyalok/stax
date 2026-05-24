"use client";

import { Bell, Columns3, Palette, Puzzle, Trash2, User, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SettingsSection,
  useSettingsModal,
} from "@/lib/settings-modal-store";

// Reuse the existing route components — they're already "use client"
// self-contained and don't depend on routing context, so they render
// fine inside a dialog too.
import AccountSection from "@/app/(app)/settings/account/page";
import AppearanceSection from "@/app/(app)/settings/appearance/page";
import PipelineSection from "@/app/(app)/settings/pipeline/page";
import NotificationsSection from "@/app/(app)/settings/notifications/page";
import IntegrationsSection from "@/app/(app)/settings/integrations/page";
import TrashSection from "@/app/(app)/settings/trash/page";

const SECTIONS: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "pipeline", label: "Pipeline", icon: Columns3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Puzzle },
  { id: "trash", label: "Trash", icon: Trash2 },
];

const SECTION_BODY: Record<SettingsSection, React.ComponentType> = {
  account: AccountSection,
  appearance: AppearanceSection,
  pipeline: PipelineSection,
  notifications: NotificationsSection,
  integrations: IntegrationsSection,
  trash: TrashSection,
};

export function SettingsModal() {
  const { open, section, setSection, close } = useSettingsModal();
  const ActiveBody = SECTION_BODY[section];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent
        // Centered modal, two-column layout: nav rail + content.
        // Wider than the default to fit settings comfortably.
        className={cn(
          "!w-[min(900px,calc(100vw-2rem))] sm:!max-w-[900px]",
          "!p-0 !gap-0 h-[min(680px,calc(100vh-2rem))]",
          "rounded-xl border bg-card shadow-2xl",
          "flex flex-row overflow-hidden"
        )}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>

        {/* Section rail */}
        <aside className="w-[200px] shrink-0 border-r bg-muted/30 flex flex-col">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.005em]">
              Settings
            </h2>
          </div>
          <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto scroll-soft">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = s.id === section;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors text-left",
                    active
                      ? "bg-background text-foreground"
                      : "text-foreground/75 hover:bg-background/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-card">
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-4 z-10"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex-1 overflow-y-auto scroll-soft p-8">
            <div className="max-w-xl">
              <ActiveBody />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
