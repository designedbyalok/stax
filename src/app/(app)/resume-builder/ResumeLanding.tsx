"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, FileUp, LayoutTemplate, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiResume, ResumeData, RESUME_TEMPLATES } from "@/lib/types/resume";
import { ResumePreview } from "./ResumePreview";

const MOCK_RESUME_DATA: ResumeData = {
  basics: {
    name: "Alex Designer",
    label: "Product Designer",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    url: "alexdesigner.com",
    summary: "Creative Product Designer with 5+ years of experience in building user-centric interfaces. Passionate about design systems, accessibility, and micro-interactions.",
    location: "San Francisco, CA",
  },
  work: [
    {
      id: "w1",
      company: "Acme Corp",
      position: "Senior Designer",
      startDate: "2020",
      endDate: "Present",
      summary: "Led the redesign of the core web application, increasing user engagement by 45%. Established a comprehensive design system.",
    },
    {
      id: "w2",
      company: "Startup Inc",
      position: "UI/UX Designer",
      startDate: "2018",
      endDate: "2020",
      summary: "Designed end-to-end mobile experiences for iOS and Android. Collaborated closely with engineering teams.",
    }
  ],
  education: [
    {
      id: "e1",
      institution: "State University",
      area: "Design",
      studyType: "BFA",
      startDate: "2014",
      endDate: "2018",
    }
  ],
  skills: [
    { id: "s1", name: "Figma", level: "Expert" },
    { id: "s2", name: "UI/UX Design", level: "Expert" },
    { id: "s3", name: "Prototyping", level: "Advanced" },
    { id: "s4", name: "Design Systems", level: "Advanced" },
    { id: "s5", name: "HTML/CSS", level: "Intermediate" },
    { id: "s6", name: "React", level: "Intermediate" }
  ],
  design: {
    template: "classic",
    themeColor: "#0f172a",
    fontFamily: "sans",
    spacing: 1,
  }
};

const TEMPLATES = RESUME_TEMPLATES;

export function ResumeLanding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (template?: string) => {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My Resume" }),
      });
      if (!res.ok) throw new Error("Failed to create resume");
      const data = await res.json();
      
      let resume = data.resume as ApiResume;

      // If a template was specified, we need to immediately PATCH the resume to update its design settings
      if (template && resume.content) {
        const updatedContent = {
          ...resume.content,
          design: {
            ...resume.content.design,
            template,
          }
        };
        const patchRes = await fetch(`/api/resume/${resume.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: updatedContent }),
        });
        if (patchRes.ok) {
          const patchData = await patchRes.json();
          resume = patchData.resume as ApiResume;
        }
      }
      
      return resume;
    },
    onSuccess: (newResume) => {
      queryClient.setQueryData(["resumes"], (old: ApiResume[] | undefined) => {
        return old ? [newResume, ...old] : [newResume];
      });
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

      // Process the PDF with AI
      const resImport = await fetch("/api/resume/import", {
        method: "POST",
        body: formData,
      });

      if (!resImport.ok) {
        const err = await resImport.json();
        throw new Error(err.error || "Failed to import resume");
      }

      const { data } = await resImport.json();

      // Save the AI processed content back to the resume
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

  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("large");

  const gridCols = {
    small: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
    medium: "grid-cols-1 md:grid-cols-3 lg:grid-cols-3",
    large: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
  }[gridSize];

  return (
    <div className="flex-1 w-full h-full bg-muted/20 flex flex-col items-center justify-center p-8">

      <div className="max-w-4xl w-full flex flex-col items-center">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground drop-shadow-sm">Resume Builder</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Create a professional resume that stands out. Choose how you want to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Card 1: Scratch */}
          <div 
            onClick={() => createMutation.mutate(undefined)}
            className="group relative flex flex-col items-center text-center gap-6 p-8 rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
              {createMutation.isPending && !templateModalOpen ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Start from Scratch</h3>
              <p className="text-sm text-muted-foreground">
                Begin with a blank canvas and build your perfect resume step-by-step.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
              Create blank <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Import */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center text-center gap-6 p-8 rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
            />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
              {isImporting ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileUp className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Import with AI</h3>
              <p className="text-sm text-muted-foreground">
                Upload your existing PDF resume and let our AI magically extract and format the content.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-sky-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
              Upload PDF <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Templates */}
          <div 
            onClick={() => setTemplateModalOpen(true)}
            className="group relative flex flex-col items-center text-center gap-6 p-8 rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Browse Templates</h3>
              <p className="text-sm text-muted-foreground">
                Jumpstart your process by selecting from our collection of professionally designed templates.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-violet-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
              View gallery <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* Template Selector Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-[calc(100vw-15vh)] sm:max-w-[calc(100vw-15vh)] w-full h-[85vh] p-0 flex flex-col overflow-hidden bg-muted/30">
          <div className="p-6 border-b bg-background flex items-center justify-between shadow-sm z-10">
            <div>
              <DialogTitle className="text-2xl font-bold">Select a Template</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Choose a design to get started. You can always change this later in the editor.</p>
            </div>
            <div className="flex items-center bg-muted/50 p-1 rounded-md ml-4 shrink-0">
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
          
          <div className="flex-1 overflow-y-auto p-8">
            <div className={`grid ${gridCols} gap-10`}>
              {TEMPLATES.map((tpl) => (
                <div key={tpl} className="flex flex-col gap-4">
                  <div 
                    className="group relative w-full rounded-xl border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden bg-white"
                    onClick={() => createMutation.mutate(tpl)}
                  >
                    {createMutation.isPending ? (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm font-medium mt-4">Creating...</span>
                      </div>
                    ) : (
                       <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/5 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button className="shadow-lg pointer-events-none">Use Template</Button>
                       </div>
                    )}
                    
                    {/* Live Preview Scaled to Fit */}
                    <ScaledTemplatePreview template={tpl} />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg capitalize">{tpl}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// A helper component to scale a full ResumePreview down to its container's width and exactly wrap its height
function ScaledTemplatePreview({ template }: { template: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [actualHeight, setActualHeight] = useState(1056);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === containerRef.current) {
          setScale(entry.contentRect.width / 816);
        }
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const dataWithTemplate: ResumeData = {
    ...MOCK_RESUME_DATA,
    design: {
      ...MOCK_RESUME_DATA.design!,
      template
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height: 1056 * scale }}>
      <div 
        className="absolute top-0 left-0"
        style={{
          width: "816px",
          transform: `scale(${scale})`,
          transformOrigin: "top left"
        }}
      >
        <div className="pointer-events-none select-none" ref={previewRef}>
          <ResumePreview resume={dataWithTemplate} />
        </div>
      </div>
    </div>
  );
}
