"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiResume, ResumeData } from "@/lib/types/resume";

interface ProjectsSectionProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function ProjectsSection({
  activeResume,
  handleUpdateContent,
}: ProjectsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Projects
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.projects ?? []),
              {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                url: "",
              },
            ];
            handleUpdateContent({ ...activeResume.content, projects: items });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {(activeResume.content.projects ?? []).map((proj, idx) => (
          <div
            key={proj.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const items = [...(activeResume.content.projects ?? [])];
                items.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  projects: items,
                });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Name</Label>
                <Input
                  className="h-7 text-xs"
                  value={proj.name}
                  onChange={(e) => {
                    const items = [...(activeResume.content.projects ?? [])];
                    items[idx] = { ...items[idx], name: e.target.value };
                    handleUpdateContent({
                      ...activeResume.content,
                      projects: items,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">Link</Label>
                <Input
                  className="h-7 text-xs"
                  placeholder="github.com/…"
                  value={proj.url ?? ""}
                  onChange={(e) => {
                    const items = [...(activeResume.content.projects ?? [])];
                    items[idx] = { ...items[idx], url: e.target.value };
                    handleUpdateContent({
                      ...activeResume.content,
                      projects: items,
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Description</Label>
              <Textarea
                className="text-xs"
                rows={2}
                value={proj.description}
                onChange={(e) => {
                  const items = [...(activeResume.content.projects ?? [])];
                  items[idx] = {
                    ...items[idx],
                    description: e.target.value,
                  };
                  handleUpdateContent({
                    ...activeResume.content,
                    projects: items,
                  });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
