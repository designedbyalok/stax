"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionEditorProps } from "./section-types";

export function AwardsSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Awards
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.awards ?? []),
              {
                id: crypto.randomUUID(),
                title: "",
                awarder: "",
                date: "",
              },
            ];
            handleUpdateContent({ ...activeResume.content, awards: items });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {(activeResume.content.awards ?? []).map((award, idx) => (
          <div
            key={award.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const items = [...(activeResume.content.awards ?? [])];
                items.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  awards: items,
                });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove
            </button>
            <div className="space-y-1.5 pt-2">
              <Label className="text-[11px]">Title</Label>
              <Input
                className="h-7 text-xs"
                value={award.title}
                onChange={(e) => {
                  const items = [...(activeResume.content.awards ?? [])];
                  items[idx] = { ...items[idx], title: e.target.value };
                  handleUpdateContent({
                    ...activeResume.content,
                    awards: items,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Awarder</Label>
                <Input
                  className="h-7 text-xs"
                  value={award.awarder}
                  onChange={(e) => {
                    const items = [...(activeResume.content.awards ?? [])];
                    items[idx] = { ...items[idx], awarder: e.target.value };
                    handleUpdateContent({
                      ...activeResume.content,
                      awards: items,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">Date</Label>
                <Input
                  className="h-7 text-xs"
                  placeholder="2023"
                  value={award.date}
                  onChange={(e) => {
                    const items = [...(activeResume.content.awards ?? [])];
                    items[idx] = { ...items[idx], date: e.target.value };
                    handleUpdateContent({
                      ...activeResume.content,
                      awards: items,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
