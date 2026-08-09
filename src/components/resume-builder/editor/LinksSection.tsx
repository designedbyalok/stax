"use client";

import React from "react";
import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ApiResume, LINK_PLATFORMS, ResumeData } from "@/lib/types/resume";
import { LINK_PLACEHOLDERS, LINK_PREFIXES } from "../constants";

interface LinksSectionProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function LinksSection({
  activeResume,
  handleUpdateContent,
}: LinksSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Links &amp; Profiles
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const links = [
              ...(activeResume.content.basics.links ?? []),
              { id: crypto.randomUUID(), label: "LinkedIn", url: "" },
            ];
            handleUpdateContent({
              ...activeResume.content,
              basics: { ...activeResume.content.basics, links },
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {(activeResume.content.basics.links ?? []).map((link, idx) => {
          const known =
            (LINK_PLATFORMS as readonly string[]).includes(link.label) &&
            link.label !== "Custom";
          const selectValue = known ? link.label : "Custom";
          const updateLink = (patch: { label?: string; url?: string }) => {
            const links = [...(activeResume.content.basics.links ?? [])];
            links[idx] = { ...links[idx], ...patch };
            handleUpdateContent({
              ...activeResume.content,
              basics: { ...activeResume.content.basics, links },
            });
          };

          const prefix = LINK_PREFIXES[selectValue];
          const urlLower = (link.url || "").toLowerCase();
          let displayValue = link.url || "";

          if (prefix) {
            if (urlLower.startsWith(`https://${prefix}`))
              displayValue = link.url.slice(`https://${prefix}`.length);
            else if (urlLower.startsWith(`http://${prefix}`))
              displayValue = link.url.slice(`http://${prefix}`.length);
            else if (urlLower.startsWith(`https://www.${prefix}`))
              displayValue = link.url.slice(`https://www.${prefix}`.length);
            else if (urlLower.startsWith(prefix))
              displayValue = link.url.slice(prefix.length);
          }

          const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value;
            if (prefix && val && !val.includes(prefix)) {
              val = `https://${prefix}${val}`;
            }
            updateLink({ url: val });
          };

          return (
            <div key={link.id} className="flex items-start gap-2 group">
              <Select
                value={selectValue}
                onValueChange={(v) =>
                  updateLink({
                    label:
                      v === "Custom"
                        ? known
                          ? ""
                          : link.label
                        : (v ?? ""),
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs w-[132px] shrink-0">
                  <span className="truncate">{selectValue}</span>
                </SelectTrigger>
                <SelectContent>
                  {LINK_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 min-w-0 space-y-1.5">
                {!known && (
                  <Input
                    className="h-8 text-xs"
                    placeholder="Label (e.g. Personal Site)"
                    value={link.label}
                    onChange={(e) => updateLink({ label: e.target.value })}
                  />
                )}
                <div className="flex items-center h-8 text-xs border border-input rounded-md shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                  {prefix && (
                    <span className="px-2.5 text-muted-foreground bg-muted border-r h-full flex items-center shrink-0">
                      {prefix}
                    </span>
                  )}
                  <input
                    className="flex-1 bg-transparent px-2.5 outline-none min-w-0"
                    placeholder={
                      prefix
                        ? "username"
                        : (LINK_PLACEHOLDERS[selectValue] ?? "https://…")
                    }
                    value={displayValue}
                    onChange={handleUrlChange}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const links = [...(activeResume.content.basics.links ?? [])];
                  links.splice(idx, 1);
                  handleUpdateContent({
                    ...activeResume.content,
                    basics: { ...activeResume.content.basics, links },
                  });
                }}
                className="text-muted-foreground hover:text-destructive text-xs shrink-0 mt-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label="Remove link"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
