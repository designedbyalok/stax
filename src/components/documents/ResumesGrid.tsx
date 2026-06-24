"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Download, FileText, ListFilter } from "@/components/icons";
import { toast } from "sonner";
import { ApiResume } from "@/lib/types/resume";
import { ResumeCard } from "@/app/(app)/resume-builder/ResumeCard";

export function ResumesGrid() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("small");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      return data.resumes as ApiResume[];
    },
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

      // Create a blank resume first to get an ID
      const resCreate = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Imported Resume" }),
      });
      if (!resCreate.ok) throw new Error("Failed to create placeholder resume");
      const { resume } = await resCreate.json();

      // Now we import data
      const resImport = await fetch("/api/resume/import", {
        method: "POST",
        body: formData,
      });

      if (!resImport.ok) {
        const err = await resImport.json();
        throw new Error(err.error || "Failed to import resume");
      }

      const { data } = await resImport.json();

      // Update the resume with the imported content
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

  if (resumesQuery.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const resumes = resumesQuery.data || [];
  
  const gridCols = {
    small: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
    medium: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[gridSize];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ListFilter className="w-4 h-4" />
          <span>Last Updated</span>
        </div>
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
        {/* Create Card */}
        <div 
          onClick={() => createMutation.mutate()}
          className="group flex flex-col gap-3 cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-xl border bg-card/50 hover:bg-card shadow-sm group-hover:shadow-md transition-all flex items-center justify-center aspect-[8.5/11]">
            {createMutation.isPending ? (
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground group-hover:border-foreground group-hover:text-foreground transition-colors">
                <Plus className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="px-1">
            <h3 className="font-semibold text-sm text-foreground">Create a new resume</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Start building your resume from scratch</p>
          </div>
        </div>

        {/* Import Card */}
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
          <div className="relative overflow-hidden rounded-xl border bg-card/50 hover:bg-card shadow-sm group-hover:shadow-md transition-all flex items-center justify-center aspect-[8.5/11]">
            {isImporting ? (
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground group-hover:border-foreground group-hover:text-foreground transition-colors">
                <Download className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="px-1">
            <h3 className="font-semibold text-sm text-foreground">Import an existing resume</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Continue where you left off</p>
          </div>
        </div>

        {/* Existing Resumes */}
        {resumes.map(resume => (
          <div key={resume.id} onClick={() => router.push(`/resume-builder?id=${resume.id}`)}>
            <ResumeCard resume={resume} onClick={() => router.push(`/resume-builder?id=${resume.id}`)} />
          </div>
        ))}
      </div>
    </div>
  );
}
