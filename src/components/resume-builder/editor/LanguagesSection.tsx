"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEditorProps } from "./section-types";

export function LanguagesSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Languages
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.languages ?? []),
              { id: crypto.randomUUID(), name: "", fluency: "" },
            ];
            handleUpdateContent({
              ...activeResume.content,
              languages: items,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {(activeResume.content.languages ?? []).map((lang, idx) => (
          <div key={lang.id} className="flex items-center gap-2 group">
            <Input
              className="h-7 text-xs flex-1"
              placeholder="Spanish"
              value={lang.name}
              onChange={(e) => {
                const items = [...(activeResume.content.languages ?? [])];
                items[idx] = { ...items[idx], name: e.target.value };
                handleUpdateContent({
                  ...activeResume.content,
                  languages: items,
                });
              }}
            />
            <Input
              className="h-7 text-xs flex-1"
              placeholder="Fluent"
              value={lang.fluency}
              onChange={(e) => {
                const items = [...(activeResume.content.languages ?? [])];
                items[idx] = { ...items[idx], fluency: e.target.value };
                handleUpdateContent({
                  ...activeResume.content,
                  languages: items,
                });
              }}
            />
            <button
              onClick={() => {
                const items = [...(activeResume.content.languages ?? [])];
                items.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  languages: items,
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
