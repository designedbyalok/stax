"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Download, Printer, Save, FileUp, Sparkles, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ApiResume, ResumeData } from "@/lib/types/resume";
import { ResumePreview } from "./ResumePreview";
import { ResumeLanding } from "./ResumeLanding";

export function ResumeClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const [activeResume, setActiveResume] = useState<ApiResume | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "design">("content");
  const [isExporting, setIsExporting] = useState(false);
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

      const res = await fetch("/api/resume/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to import resume");
      }

      const { data } = await res.json();
      
      // Update local state with the parsed data
      handleUpdateContent(data);
      toast.success("Resume imported successfully! Please review the details.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      setActiveResume(newResume);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: ResumeData }) => {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to update resume");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium");

  React.useEffect(() => {
    if (resumesQuery.data) {
      if (resumeId) {
        const resume = resumesQuery.data.find(r => r.id === resumeId);
        if (resume) {
          // Only set if we haven't already set this exact resume to avoid overwriting edits
          setActiveResume((current) => current?.id === resume.id ? current : resume);
        } else {
          toast.error("Resume not found");
          router.push("/documents");
        }
      }
    }
  }, [resumeId, resumesQuery.data, router]);

  const handleUpdateContent = (newContent: ResumeData) => {
    if (!activeResume) return;
    setActiveResume({ ...activeResume, content: newContent });
  };

  if (resumesQuery.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resumeId) {
    return <ResumeLanding />;
  }

  if (!activeResume) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ id: activeResume.id, content: activeResume.content });
    toast.success("Resume saved");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportToDocuments = async () => {
    try {
      setIsExporting(true);
      // Dynamically import html2pdf
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = document.getElementById("resume-preview-content");
      if (!element) throw new Error("Preview element not found");

      const opt = {
        margin: 0,
        filename: `${activeResume.content.basics.name || "Resume"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      };

      // Generate the PDF as a Blob
      const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

      // Upload the PDF
      const formData = new FormData();
      formData.append("file", new File([pdfBlob], opt.filename, { type: "application/pdf" }));
      formData.append("name", activeResume.title || "My Builder Resume");
      formData.append("type", "RESUME");
      formData.append("isPrimary", "false");

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      toast.success("Resume saved to Documents!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-muted/20">
      {/* LEFT: Editor */}
      <div className="w-full md:w-[450px] border-r bg-card flex flex-col h-full z-10 shadow-sm print:hidden">
        <div className="p-4 border-b flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => router.push("/documents")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold text-sm">Editor</h2>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
              />
              <Button size="sm" variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                {isImporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                Import with AI
              </Button>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Save Draft
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1" variant="secondary" onClick={handleExportToDocuments} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save to Documents
            </Button>
            <Button size="sm" className="flex-1" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print PDF
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center p-1 bg-muted rounded-md mt-2">
            <button 
              className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-sm transition-all ${activeTab === 'content' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
            <button 
              className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-sm transition-all ${activeTab === 'design' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('design')}
            >
              Design
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Personal Info</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input 
                      value={activeResume.content.basics.name} 
                      onChange={(e) => handleUpdateContent({
                        ...activeResume.content,
                        basics: { ...activeResume.content.basics, name: e.target.value }
                      })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input 
                    value={activeResume.content.basics.email} 
                    onChange={(e) => handleUpdateContent({
                      ...activeResume.content,
                      basics: { ...activeResume.content.basics, email: e.target.value }
                    })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input 
                    value={activeResume.content.basics.phone} 
                    onChange={(e) => handleUpdateContent({
                      ...activeResume.content,
                      basics: { ...activeResume.content.basics, phone: e.target.value }
                    })} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Location</Label>
                <Input 
                  value={activeResume.content.basics.location} 
                  onChange={(e) => handleUpdateContent({
                    ...activeResume.content,
                    basics: { ...activeResume.content.basics, location: e.target.value }
                  })} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Headline</Label>
                <Input 
                  value={activeResume.content.basics.headline} 
                  onChange={(e) => handleUpdateContent({
                    ...activeResume.content,
                    basics: { ...activeResume.content.basics, headline: e.target.value }
                  })} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Professional Summary</Label>
                <Textarea 
                  rows={4}
                  value={activeResume.content.basics.summary} 
                  onChange={(e) => handleUpdateContent({
                    ...activeResume.content,
                    basics: { ...activeResume.content.basics, summary: e.target.value }
                  })} 
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Work Experience</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const newWork = [...activeResume.content.work, { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", summary: "" }];
                handleUpdateContent({ ...activeResume.content, work: newWork });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {activeResume.content.work.map((work, idx) => (
                <div key={work.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const newWork = [...activeResume.content.work];
                    newWork.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, work: newWork });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Company</Label>
                      <Input className="h-7 text-xs" value={work.company} onChange={(e) => {
                        const newWork = [...activeResume.content.work];
                        newWork[idx].company = e.target.value;
                        handleUpdateContent({ ...activeResume.content, work: newWork });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Position</Label>
                      <Input className="h-7 text-xs" value={work.position} onChange={(e) => {
                        const newWork = [...activeResume.content.work];
                        newWork[idx].position = e.target.value;
                        handleUpdateContent({ ...activeResume.content, work: newWork });
                      }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Start Date</Label>
                      <Input className="h-7 text-xs" value={work.startDate} placeholder="Jan 2020" onChange={(e) => {
                        const newWork = [...activeResume.content.work];
                        newWork[idx].startDate = e.target.value;
                        handleUpdateContent({ ...activeResume.content, work: newWork });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">End Date</Label>
                      <Input className="h-7 text-xs" value={work.endDate} placeholder="Present" onChange={(e) => {
                        const newWork = [...activeResume.content.work];
                        newWork[idx].endDate = e.target.value;
                        handleUpdateContent({ ...activeResume.content, work: newWork });
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Description</Label>
                    <Textarea className="text-xs" rows={3} value={work.summary} onChange={(e) => {
                      const newWork = [...activeResume.content.work];
                      newWork[idx].summary = e.target.value;
                      handleUpdateContent({ ...activeResume.content, work: newWork });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skills</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const newSkills = [...(activeResume.content.skills || []), { id: crypto.randomUUID(), name: "", level: "" }];
                handleUpdateContent({ ...activeResume.content, skills: newSkills });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(activeResume.content.skills || []).map((skill, idx) => (
                <div key={skill.id} className="flex items-center gap-2 relative group">
                  <Input 
                    className="h-8 text-xs flex-1" 
                    placeholder="E.g., JavaScript" 
                    value={skill.name} 
                    onChange={(e) => {
                      const newSkills = [...activeResume.content.skills];
                      newSkills[idx].name = e.target.value;
                      handleUpdateContent({ ...activeResume.content, skills: newSkills });
                    }} 
                  />
                  <button onClick={() => {
                    const newSkills = [...activeResume.content.skills];
                    newSkills.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, skills: newSkills });
                  }} className="text-muted-foreground hover:text-destructive text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Education</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const newEd = [...activeResume.content.education, { id: crypto.randomUUID(), institution: "", studyType: "", area: "", startDate: "", endDate: "" }];
                handleUpdateContent({ ...activeResume.content, education: newEd });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {activeResume.content.education.map((ed, idx) => (
                <div key={ed.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const newEd = [...activeResume.content.education];
                    newEd.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, education: newEd });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Institution</Label>
                      <Input className="h-7 text-xs" value={ed.institution} onChange={(e) => {
                        const newEd = [...activeResume.content.education];
                        newEd[idx].institution = e.target.value;
                        handleUpdateContent({ ...activeResume.content, education: newEd });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Degree/Study Type</Label>
                      <Input className="h-7 text-xs" value={ed.studyType} onChange={(e) => {
                        const newEd = [...activeResume.content.education];
                        newEd[idx].studyType = e.target.value;
                        handleUpdateContent({ ...activeResume.content, education: newEd });
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Area of Study</Label>
                    <Input className="h-7 text-xs" value={ed.area} onChange={(e) => {
                      const newEd = [...activeResume.content.education];
                      newEd[idx].area = e.target.value;
                      handleUpdateContent({ ...activeResume.content, education: newEd });
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Start Date</Label>
                      <Input className="h-7 text-xs" value={ed.startDate} placeholder="Aug 2018" onChange={(e) => {
                        const newEd = [...activeResume.content.education];
                        newEd[idx].startDate = e.target.value;
                        handleUpdateContent({ ...activeResume.content, education: newEd });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">End Date</Label>
                      <Input className="h-7 text-xs" value={ed.endDate} placeholder="May 2022" onChange={(e) => {
                        const newEd = [...activeResume.content.education];
                        newEd[idx].endDate = e.target.value;
                        handleUpdateContent({ ...activeResume.content, education: newEd });
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8">
              {/* Template Selector */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Layout Template</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['classic', 'modern', 'minimal'].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => handleUpdateContent({
                        ...activeResume.content,
                        design: { ...activeResume.content.design, template: tpl } as any
                      })}
                      className={`py-2 px-1 border rounded-md text-xs font-medium capitalize transition-all ${
                        (activeResume.content.design?.template || 'classic') === tpl 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </section>

              {/* Theme Color */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Color</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Slate', value: '#0f172a' },
                    { name: 'Blue', value: '#2563eb' },
                    { name: 'Rose', value: '#e11d48' },
                    { name: 'Emerald', value: '#059669' },
                    { name: 'Violet', value: '#7c3aed' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleUpdateContent({
                        ...activeResume.content,
                        design: { ...activeResume.content.design, themeColor: color.value } as any
                      })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${(activeResume.content.design?.themeColor || '#0f172a') === color.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </section>

              {/* Typography */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Typography</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Sans', value: 'sans', style: 'font-sans' },
                    { label: 'Serif', value: 'serif', style: 'font-serif' },
                    { label: 'Mono', value: 'mono', style: 'font-mono' },
                  ].map((font) => (
                    <button
                      key={font.value}
                      onClick={() => handleUpdateContent({
                        ...activeResume.content,
                        design: { ...activeResume.content.design, fontFamily: font.value } as any
                      })}
                      className={`py-2 px-1 border rounded-md text-xs font-medium transition-all ${font.style} ${
                        (activeResume.content.design?.fontFamily || 'sans') === font.value 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Spacing */}
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
                  value={activeResume.content.design?.spacing || 1}
                  onChange={(e) => handleUpdateContent({
                    ...activeResume.content,
                    design: { ...activeResume.content.design, spacing: parseFloat(e.target.value) } as any
                  })}
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Compact</span>
                  <span>Relaxed</span>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Preview Pane */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-muted/20 print:p-0 print:bg-white print:overflow-visible">
        <ResumePreview resume={activeResume.content} />
      </div>
    </div>
  );
}
