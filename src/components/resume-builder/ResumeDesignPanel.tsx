"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { ResizablePanel } from "@/components/ui/resizable";
import { useResumeFontCatalog } from "@/lib/resume-font-loader";
import { RESUME_FONTS_BY_CATEGORY, resolveFont } from "@/lib/resume-fonts";
import { ApiResume, RESUME_TEMPLATES, ResumeData } from "@/lib/types/resume";
import { BACKGROUND_COLORS, TEXT_COLORS, THEME_COLORS } from "./constants";
import { ColorSwatches } from "./components/ColorSwatches";

interface ResumeDesignPanelProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function ResumeDesignPanel({
  activeResume,
  handleUpdateContent,
}: ResumeDesignPanelProps) {
  const [catalogEnabled, setCatalogEnabled] = useState(false);
  useResumeFontCatalog(catalogEnabled);

  return (
    <ResizablePanel
      defaultSize={20}
      minSize={15}
      className="border-l bg-card flex flex-col h-full z-10 shadow-sm print:hidden responsive-panel"
      style={{ maxWidth: 300 }}
    >
      <div className="p-4 border-b shrink-0">
        <h2 className="text-sm font-semibold text-foreground">Design</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Template, color &amp; typography</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Layout Template</h3>
            <div className="grid grid-cols-2 gap-2">
              {RESUME_TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  onClick={() =>
                    handleUpdateContent({
                      ...activeResume.content,
                      design: { ...activeResume.content.design, template: tpl } as ApiResume["content"]["design"],
                    })
                  }
                  className={`py-2 px-1 border rounded-md text-xs font-medium capitalize transition-all ${
                    (activeResume.content.design?.template || "classic") === tpl
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Font</h3>
            {(() => {
              const currentFont = resolveFont(activeResume.content.design?.fontFamily).font.name;
              return (
                <Select
                  value={currentFont}
                  onOpenChange={(open) => {
                    if (open) setCatalogEnabled(true);
                  }}
                  onValueChange={(v) =>
                    handleUpdateContent({
                      ...activeResume.content,
                      design: { ...activeResume.content.design, fontFamily: v ?? "Inter" } as ApiResume["content"]["design"],
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <span className="truncate" style={{ fontFamily: `"${currentFont}"` }}>
                      {currentFont}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="max-h-[320px]">
                    {(["Sans Serif", "Serif", "Monospace"] as const).map((cat) => (
                      <SelectGroup key={cat}>
                        <SelectLabel>{cat}</SelectLabel>
                        {RESUME_FONTS_BY_CATEGORY[cat].map((f) => (
                          <SelectItem key={f.name} value={f.name}>
                            <span style={{ fontFamily: `"${f.name}", ${f.stack}` }}>{f.name}</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Color</h3>
            <ColorSwatches
              options={THEME_COLORS}
              current={activeResume.content.design?.themeColor || "#0f172a"}
              onSelect={(value) =>
                handleUpdateContent({
                  ...activeResume.content,
                  design: { ...activeResume.content.design, themeColor: value } as ApiResume["content"]["design"],
                })
              }
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Background</h3>
            <ColorSwatches
              options={BACKGROUND_COLORS}
              current={activeResume.content.design?.backgroundColor || "#ffffff"}
              onSelect={(value) =>
                handleUpdateContent({
                  ...activeResume.content,
                  design: { ...activeResume.content.design, backgroundColor: value } as ApiResume["content"]["design"],
                })
              }
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Text Color</h3>
            <ColorSwatches
              options={TEXT_COLORS}
              current={activeResume.content.design?.textColor || "#27272a"}
              onSelect={(value) =>
                handleUpdateContent({
                  ...activeResume.content,
                  design: { ...activeResume.content.design, textColor: value } as ApiResume["content"]["design"],
                })
              }
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spacing</h3>
              <span className="text-xs text-muted-foreground">{activeResume.content.design?.spacing || 1}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              aria-label="Resume spacing"
              value={activeResume.content.design?.spacing || 1}
              onChange={(e) =>
                handleUpdateContent({
                  ...activeResume.content,
                  design: {
                    ...activeResume.content.design,
                    spacing: parseFloat(e.target.value),
                  } as ApiResume["content"]["design"],
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Compact</span>
              <span>Relaxed</span>
            </div>
          </section>
        </div>
      </div>
    </ResizablePanel>
  );
}
