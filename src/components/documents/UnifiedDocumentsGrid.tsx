"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Download, ListFilter, Check } from "lucide-react";
import { toast } from "sonner";
import { ApiResume } from "@/lib/types/resume";
import { api, ApiDocument } from "@/lib/api-client";
import { ResumeCard } from "@/app/(app)/resume-builder/ResumeCard";
import { DocumentCard } from "./DocumentCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UnifiedItem = 
  | { type: "GENERATED_RESUME"; data: ApiResume; updatedAt: number }
  | { type: "UPLOADED_DOCUMENT"; data: ApiDocument; updatedAt: number };

export function UnifiedDocumentsGrid({ 
  tab,
  onPreview
}: { 
  tab: "ALL" | "RESUME" | "COVER_LETTER",
  onPreview: (doc: ApiDocument) => void 
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("small");
  const [filter, setFilter] = useState<"ALL" | "GENERATED" | "UPLOADED">("ALL");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch Resumes (Platform Generated)
  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      return data.resumes as ApiResume[];
    },
  });

  // Fetch Documents (Uploaded PDFs/DOCX)
  const documentsQuery = useQuery({
    queryKey: ["documents", "ALL"], // Always fetch all documents so we can filter locally
    queryFn: () => api.listDocuments().then(res => res.documents),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My Resume" }),
      });
      if (!res.ok) throw new Error("Failed to create resume");
      const data = await res.json();
      return data.resume as ApiResume;
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      router.push(`/resume-builder?id=${newResume.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported for import right now.");
      return;
    }

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", file);

      const resCreate = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Imported Resume" }),
      });
      if (!resCreate.ok) throw new Error("Failed to create placeholder resume");
      const { resume } = await resCreate.json();

      const resImport = await fetch("/api/resume/import", {
        method: "POST",
        body: formData,
      });

      if (!resImport.ok) {
        const err = await resImport.json();
        throw new Error(err.error || "Failed to import resume");
      }

      const { data } = await resImport.json();

      await fetch(`/api/resume/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data }),
      });

      toast.success("Resume imported successfully!");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      router.push(`/resume-builder?id=${resume.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isLoading = resumesQuery.isLoading || documentsQuery.isLoading;

  const unifiedItems = useMemo(() => {
    let items: UnifiedItem[] = [];

    // Filter by Dropdown Filter
    const showGenerated = filter === "ALL" || filter === "GENERATED";
    const showUploaded = filter === "ALL" || filter === "UPLOADED";

    // Only Generated Resumes belong to the "RESUME" tab or "ALL" tab
    if (showGenerated && (tab === "ALL" || tab === "RESUME") && resumesQuery.data) {
      resumesQuery.data.forEach(r => {
        items.push({
          type: "GENERATED_RESUME",
          data: r,
          updatedAt: new Date(r.updatedAt).getTime()
        });
      });
    }

    if (showUploaded && documentsQuery.data) {
      documentsQuery.data.forEach(d => {
        // Filter by Tab
        if (tab === "ALL" || tab === d.type) {
          items.push({
            type: "UPLOADED_DOCUMENT",
            data: d,
            updatedAt: new Date(d.updatedAt).getTime()
          });
        }
      });
    }

    // Sort by updated descending
    items.sort((a, b) => b.updatedAt - a.updatedAt);
    return items;
  }, [resumesQuery.data, documentsQuery.data, tab, filter]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const gridCols = {
    small: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
    medium: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[gridSize];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:bg-muted px-2 py-1.5 rounded-md transition-colors">
              <ListFilter className="w-4 h-4 text-muted-foreground" />
              <span>
                {filter === "ALL" && "Last Updated"}
                {filter === "GENERATED" && "Generated Resumes"}
                {filter === "UPLOADED" && "Uploaded Files"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => setFilter("ALL")}>
              Last Updated
              {filter === "ALL" && <Check className="ml-auto w-4 h-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("GENERATED")}>
              Generated Resumes
              {filter === "GENERATED" && <Check className="ml-auto w-4 h-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("UPLOADED")}>
              Uploaded Files
              {filter === "UPLOADED" && <Check className="ml-auto w-4 h-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center bg-muted/50 p-1 rounded-md">
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setGridSize(size)}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors capitalize ${
                gridSize === size ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${gridCols} pb-10`}>
        {/* Create Card (Only shown if we are in Resumes or All, and filter allows Generated) */}
        {(tab === "ALL" || tab === "RESUME") && filter !== "UPLOADED" && (
          <div 
            onClick={() => createMutation.mutate()}
            className="group flex flex-col gap-3 cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm group-hover:shadow-md transition-all flex items-center justify-center aspect-[8.5/11]">
              {createMutation.isPending ? (
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground group-hover:border-foreground group-hover:text-foreground transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="px-1 text-center">
              <h3 className="font-semibold text-sm text-foreground">Create Resume</h3>
            </div>
          </div>
        )}

        {/* Import Card (Only shown if we are in Resumes or All, and filter allows Generated) */}
        {(tab === "ALL" || tab === "RESUME") && filter !== "UPLOADED" && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col gap-3 cursor-pointer"
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
            />
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm group-hover:shadow-md transition-all flex items-center justify-center aspect-[8.5/11]">
              {isImporting ? (
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground group-hover:border-foreground group-hover:text-foreground transition-colors">
                  <Download className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="px-1 text-center">
              <h3 className="font-semibold text-sm text-foreground">Import Resume</h3>
            </div>
          </div>
        )}

        {/* Unified Items */}
        {unifiedItems.map(item => {
          if (item.type === "GENERATED_RESUME") {
            return (
              <div key={`gen_${item.data.id}`}>
                <ResumeCard resume={item.data} onClick={() => router.push(`/resume-builder?id=${item.data.id}`)} />
              </div>
            );
          } else {
            return (
              <div key={`up_${item.data.id}`}>
                <DocumentCard 
                  doc={item.data} 
                  type={item.data.type} 
                  onPreview={onPreview} 
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
