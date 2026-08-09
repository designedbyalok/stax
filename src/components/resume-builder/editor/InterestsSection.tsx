"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEditorProps } from "./section-types";

export function InterestsSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Interests
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.interests ?? []),
              { id: crypto.randomUUID(), name: "", keywords: "" },
            ];
            handleUpdateContent({
              ...activeResume.content,
              interests: items,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {(activeResume.content.interests ?? []).map((it, idx) => (
          <div key={it.id} className="flex items-center gap-2 group">
            <Input
              className="h-7 text-xs w-[38%] shrink-0"
              placeholder="Photography"
              value={it.name}
              onChange={(e) => {
                const items = [...(activeResume.content.interests ?? [])];
                items[idx] = { ...items[idx], name: e.target.value };
                handleUpdateContent({
                  ...activeResume.content,
                  interests: items,
                });
              }}
            />
            <Input
              className="h-7 text-xs flex-1 min-w-0"
              placeholder="film, travel"
              value={it.keywords ?? ""}
              onChange={(e) => {
                const items = [...(activeResume.content.interests ?? [])];
                items[idx] = { ...items[idx], keywords: e.target.value };
                handleUpdateContent({
                  ...activeResume.content,
                  interests: items,
                });
              }}
            />
            <button
              onClick={() => {
                const items = [...(activeResume.content.interests ?? [])];
                items.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  interests: items,
                });
              }}
              className="text-muted-foreground hover:text-destructive text-xs px-1 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
