"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSectionItem } from "./CustomSectionItem";
import { SectionEditorProps } from "./section-types";

export function CustomSectionsSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Custom Sections
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const sections = [
              ...(activeResume.content.customSections ?? []),
              {
                id: crypto.randomUUID(),
                title: "",
                items: [] as Array<{
                  id: string;
                  title?: string;
                  subtitle?: string;
                  date?: string;
                  description?: string;
                }>,
              },
            ];
            handleUpdateContent({
              ...activeResume.content,
              customSections: sections,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-5">
        {(activeResume.content.customSections ?? []).map((cs, sIdx) => (
          <div
            key={cs.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const sections = [
                  ...(activeResume.content.customSections ?? []),
                ];
                sections.splice(sIdx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  customSections: sections,
                });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove section
            </button>
            <div className="space-y-1.5 pt-2">
              <Label className="text-[11px]">Section title</Label>
              <Input
                className="h-7 text-xs"
                placeholder="Speaking engagements"
                value={cs.title}
                onChange={(e) => {
                  const sections = [
                    ...(activeResume.content.customSections ?? []),
                  ];
                  sections[sIdx] = {
                    ...sections[sIdx],
                    title: e.target.value,
                  };
                  handleUpdateContent({
                    ...activeResume.content,
                    customSections: sections,
                  });
                }}
              />
            </div>
            <div className="space-y-3 pt-1">
              {(cs.items ?? []).map((item, iIdx) => (
                <CustomSectionItem
                  key={item.id}
                  item={item}
                  sIdx={sIdx}
                  iIdx={iIdx}
                  content={activeResume.content}
                  handleUpdateContent={handleUpdateContent}
                />
              ))}
              <button
                onClick={() => {
                  const sections = [
                    ...(activeResume.content.customSections ?? []),
                  ];
                  const items = [
                    ...sections[sIdx].items,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      subtitle: "",
                      date: "",
                      description: "",
                    },
                  ];
                  sections[sIdx] = { ...sections[sIdx], items };
                  handleUpdateContent({
                    ...activeResume.content,
                    customSections: sections,
                  });
                }}
                className="w-full text-[11px] text-muted-foreground hover:text-foreground border border-dashed rounded-md py-1.5 transition-colors"
              >
                + Add item
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
