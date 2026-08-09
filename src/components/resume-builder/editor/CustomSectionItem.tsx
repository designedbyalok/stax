"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "@/lib/types/resume";

interface CustomSectionItemProps {
  item: {
    id: string;
    title?: string;
    subtitle?: string;
    date?: string;
    description?: string;
  };
  sIdx: number;
  iIdx: number;
  content: ResumeData;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function CustomSectionItem({
  item,
  sIdx,
  iIdx,
  content,
  handleUpdateContent,
}: CustomSectionItemProps) {
  return (
    <div className="p-2.5 border rounded-md bg-background space-y-2 relative group/item">
      <button
        onClick={() => {
          const sections = [...(content.customSections ?? [])];
          const items = [...sections[sIdx].items];
          items.splice(iIdx, 1);
          sections[sIdx] = { ...sections[sIdx], items };
          handleUpdateContent({
            ...content,
            customSections: sections,
          });
        }}
        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 text-[11px]"
      >
        Remove
      </button>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px]">Title</Label>
          <Input
            className="h-7 text-xs"
            value={item.title ?? ""}
            onChange={(e) => {
              const sections = [...(content.customSections ?? [])];
              const items = [...sections[sIdx].items];
              items[iIdx] = {
                ...items[iIdx],
                title: e.target.value,
              };
              sections[sIdx] = { ...sections[sIdx], items };
              handleUpdateContent({
                ...content,
                customSections: sections,
              });
            }}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Date</Label>
          <Input
            className="h-7 text-xs"
            placeholder="2024"
            value={item.date ?? ""}
            onChange={(e) => {
              const sections = [...(content.customSections ?? [])];
              const items = [...sections[sIdx].items];
              items[iIdx] = {
                ...items[iIdx],
                date: e.target.value,
              };
              sections[sIdx] = { ...sections[sIdx], items };
              handleUpdateContent({
                ...content,
                customSections: sections,
              });
            }}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Subtitle</Label>
        <Input
          className="h-7 text-xs"
          value={item.subtitle ?? ""}
          onChange={(e) => {
            const sections = [...(content.customSections ?? [])];
            const items = [...sections[sIdx].items];
            items[iIdx] = {
              ...items[iIdx],
              subtitle: e.target.value,
            };
            sections[sIdx] = { ...sections[sIdx], items };
            handleUpdateContent({
              ...content,
              customSections: sections,
            });
          }}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Description</Label>
        <Textarea
          className="text-xs"
          rows={2}
          value={item.description ?? ""}
          onChange={(e) => {
            const sections = [...(content.customSections ?? [])];
            const items = [...sections[sIdx].items];
            items[iIdx] = {
              ...items[iIdx],
              description: e.target.value,
            };
            sections[sIdx] = { ...sections[sIdx], items };
            handleUpdateContent({
              ...content,
              customSections: sections,
            });
          }}
        />
      </div>
    </div>
  );
}
