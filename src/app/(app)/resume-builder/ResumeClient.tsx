"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Printer, Save, Sparkles, ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ApiResume, ResumeData } from "@/lib/types/resume";
import { ResumePreview } from "./ResumePreview";
import { ResumeLanding } from "./ResumeLanding";

// Snapshot used to detect unsaved edits for autosave.
function serializeResume(r: ApiResume): string {
  return JSON.stringify({ title: r.title, content: r.content });
}

export function ResumeClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const [activeResume, setActiveResume] = useState<ApiResume | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Autosave bookkeeping. savedSnapshotRef holds the last-persisted
  // serialization; loadedIdRef tracks which resume that snapshot is for.
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const savedSnapshotRef = useRef<string>("");
  const loadedIdRef = useRef<string | null>(null);

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
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: string;
      title?: string;
      content: ResumeData;
    }) => {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
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

  // When a different resume is adopted, capture its snapshot so the
  // initial load doesn't look like an unsaved edit.
  useEffect(() => {
    if (activeResume && loadedIdRef.current !== activeResume.id) {
      loadedIdRef.current = activeResume.id;
      savedSnapshotRef.current = serializeResume(activeResume);
      setSaveStatus("saved");
    }
  }, [activeResume]);

  // Debounced autosave: 900ms after the user stops editing, persist
  // title + content. Status drives the header indicator.
  useEffect(() => {
    if (!activeResume) return;
    const snapshot = serializeResume(activeResume);
    if (snapshot === savedSnapshotRef.current) return;

    setSaveStatus("unsaved");
    const resume = activeResume;
    const timer = setTimeout(() => {
      setSaveStatus("saving");
      updateMutation.mutate(
        { id: resume.id, title: resume.title, content: resume.content },
        {
          onSuccess: () => {
            savedSnapshotRef.current = snapshot;
            setSaveStatus("saved");
          },
          onError: () => setSaveStatus("unsaved"),
        }
      );
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResume]);

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
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "in" as const,
          format: "letter" as const,
          orientation: "portrait" as const,
        },
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
      {/* LEFT: Form / Content panel */}
      <div className="w-full md:w-[450px] border-r bg-card flex flex-col h-full z-10 shadow-sm print:hidden">
        <div className="p-4 border-b flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Button size="icon" variant="ghost" className="h-8 w-8 -ml-2 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => router.push("/resume-builder")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <input
                value={activeResume.title}
                onChange={(e) =>
                  setActiveResume({ ...activeResume, title: e.target.value })
                }
                placeholder="Untitled resume"
                aria-label="Resume title"
                className="font-semibold text-sm bg-transparent border border-transparent rounded px-1.5 py-0.5 -ml-1.5 min-w-0 flex-1 outline-none hover:bg-muted/50 focus:bg-muted/50 focus:border-border transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SaveStatus status={saveStatus} />
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
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
              <div className="space-y-1.5">
                <Label className="text-xs">Website</Label>
                <Input
                  placeholder="yoursite.com"
                  value={activeResume.content.basics.url ?? ""}
                  onChange={(e) => handleUpdateContent({
                    ...activeResume.content,
                    basics: { ...activeResume.content.basics, url: e.target.value }
                  })}
                />
              </div>

              {/* Links (LinkedIn, GitHub, etc.) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Links</Label>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => {
                      const links = [
                        ...(activeResume.content.basics.links ?? []),
                        { id: crypto.randomUUID(), label: "", url: "" },
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
                  {(activeResume.content.basics.links ?? []).map((link, idx) => (
                    <div key={link.id} className="flex items-center gap-2 group">
                      <Input
                        className="h-7 text-xs w-[34%] shrink-0"
                        placeholder="LinkedIn"
                        value={link.label}
                        onChange={(e) => {
                          const links = [...(activeResume.content.basics.links ?? [])];
                          links[idx] = { ...links[idx], label: e.target.value };
                          handleUpdateContent({
                            ...activeResume.content,
                            basics: { ...activeResume.content.basics, links },
                          });
                        }}
                      />
                      <Input
                        className="h-7 text-xs flex-1 min-w-0"
                        placeholder="linkedin.com/in/you"
                        value={link.url}
                        onChange={(e) => {
                          const links = [...(activeResume.content.basics.links ?? [])];
                          links[idx] = { ...links[idx], url: e.target.value };
                          handleUpdateContent({
                            ...activeResume.content,
                            basics: { ...activeResume.content.basics, links },
                          });
                        }}
                      />
                      <button
                        onClick={() => {
                          const links = [...(activeResume.content.basics.links ?? [])];
                          links.splice(idx, 1);
                          handleUpdateContent({
                            ...activeResume.content,
                            basics: { ...activeResume.content.basics, links },
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove link"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
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

          {/* Projects */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projects</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.projects ?? []), { id: crypto.randomUUID(), name: "", description: "", url: "" }];
                handleUpdateContent({ ...activeResume.content, projects: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {(activeResume.content.projects ?? []).map((proj, idx) => (
                <div key={proj.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const items = [...(activeResume.content.projects ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, projects: items });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Name</Label>
                      <Input className="h-7 text-xs" value={proj.name} onChange={(e) => {
                        const items = [...(activeResume.content.projects ?? [])];
                        items[idx] = { ...items[idx], name: e.target.value };
                        handleUpdateContent({ ...activeResume.content, projects: items });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Link</Label>
                      <Input className="h-7 text-xs" placeholder="github.com/…" value={proj.url ?? ""} onChange={(e) => {
                        const items = [...(activeResume.content.projects ?? [])];
                        items[idx] = { ...items[idx], url: e.target.value };
                        handleUpdateContent({ ...activeResume.content, projects: items });
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Description</Label>
                    <Textarea className="text-xs" rows={2} value={proj.description} onChange={(e) => {
                      const items = [...(activeResume.content.projects ?? [])];
                      items[idx] = { ...items[idx], description: e.target.value };
                      handleUpdateContent({ ...activeResume.content, projects: items });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Certifications</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.certifications ?? []), { id: crypto.randomUUID(), name: "", issuer: "", date: "" }];
                handleUpdateContent({ ...activeResume.content, certifications: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {(activeResume.content.certifications ?? []).map((cert, idx) => (
                <div key={cert.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const items = [...(activeResume.content.certifications ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, certifications: items });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-[11px]">Name</Label>
                    <Input className="h-7 text-xs" value={cert.name} onChange={(e) => {
                      const items = [...(activeResume.content.certifications ?? [])];
                      items[idx] = { ...items[idx], name: e.target.value };
                      handleUpdateContent({ ...activeResume.content, certifications: items });
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Issuer</Label>
                      <Input className="h-7 text-xs" value={cert.issuer} onChange={(e) => {
                        const items = [...(activeResume.content.certifications ?? [])];
                        items[idx] = { ...items[idx], issuer: e.target.value };
                        handleUpdateContent({ ...activeResume.content, certifications: items });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Date</Label>
                      <Input className="h-7 text-xs" placeholder="2024" value={cert.date} onChange={(e) => {
                        const items = [...(activeResume.content.certifications ?? [])];
                        items[idx] = { ...items[idx], date: e.target.value };
                        handleUpdateContent({ ...activeResume.content, certifications: items });
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Awards */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Awards</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.awards ?? []), { id: crypto.randomUUID(), title: "", awarder: "", date: "" }];
                handleUpdateContent({ ...activeResume.content, awards: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {(activeResume.content.awards ?? []).map((award, idx) => (
                <div key={award.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const items = [...(activeResume.content.awards ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, awards: items });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-[11px]">Title</Label>
                    <Input className="h-7 text-xs" value={award.title} onChange={(e) => {
                      const items = [...(activeResume.content.awards ?? [])];
                      items[idx] = { ...items[idx], title: e.target.value };
                      handleUpdateContent({ ...activeResume.content, awards: items });
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Awarder</Label>
                      <Input className="h-7 text-xs" value={award.awarder} onChange={(e) => {
                        const items = [...(activeResume.content.awards ?? [])];
                        items[idx] = { ...items[idx], awarder: e.target.value };
                        handleUpdateContent({ ...activeResume.content, awards: items });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Date</Label>
                      <Input className="h-7 text-xs" placeholder="2023" value={award.date} onChange={(e) => {
                        const items = [...(activeResume.content.awards ?? [])];
                        items[idx] = { ...items[idx], date: e.target.value };
                        handleUpdateContent({ ...activeResume.content, awards: items });
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Languages */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Languages</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.languages ?? []), { id: crypto.randomUUID(), name: "", fluency: "" }];
                handleUpdateContent({ ...activeResume.content, languages: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(activeResume.content.languages ?? []).map((lang, idx) => (
                <div key={lang.id} className="flex items-center gap-2 group">
                  <Input className="h-7 text-xs flex-1" placeholder="Spanish" value={lang.name} onChange={(e) => {
                    const items = [...(activeResume.content.languages ?? [])];
                    items[idx] = { ...items[idx], name: e.target.value };
                    handleUpdateContent({ ...activeResume.content, languages: items });
                  }} />
                  <Input className="h-7 text-xs flex-1" placeholder="Fluent" value={lang.fluency} onChange={(e) => {
                    const items = [...(activeResume.content.languages ?? [])];
                    items[idx] = { ...items[idx], fluency: e.target.value };
                    handleUpdateContent({ ...activeResume.content, languages: items });
                  }} />
                  <button onClick={() => {
                    const items = [...(activeResume.content.languages ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, languages: items });
                  }} className="text-muted-foreground hover:text-destructive text-xs px-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Publications */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Publications</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.publications ?? []), { id: crypto.randomUUID(), name: "", publisher: "", date: "", url: "" }];
                handleUpdateContent({ ...activeResume.content, publications: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {(activeResume.content.publications ?? []).map((pub, idx) => (
                <div key={pub.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const items = [...(activeResume.content.publications ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, publications: items });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-[11px]">Title</Label>
                    <Input className="h-7 text-xs" value={pub.name} onChange={(e) => {
                      const items = [...(activeResume.content.publications ?? [])];
                      items[idx] = { ...items[idx], name: e.target.value };
                      handleUpdateContent({ ...activeResume.content, publications: items });
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Publisher</Label>
                      <Input className="h-7 text-xs" value={pub.publisher} onChange={(e) => {
                        const items = [...(activeResume.content.publications ?? [])];
                        items[idx] = { ...items[idx], publisher: e.target.value };
                        handleUpdateContent({ ...activeResume.content, publications: items });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Date</Label>
                      <Input className="h-7 text-xs" placeholder="2024" value={pub.date} onChange={(e) => {
                        const items = [...(activeResume.content.publications ?? [])];
                        items[idx] = { ...items[idx], date: e.target.value };
                        handleUpdateContent({ ...activeResume.content, publications: items });
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Link</Label>
                    <Input className="h-7 text-xs" placeholder="example.com/article" value={pub.url ?? ""} onChange={(e) => {
                      const items = [...(activeResume.content.publications ?? [])];
                      items[idx] = { ...items[idx], url: e.target.value };
                      handleUpdateContent({ ...activeResume.content, publications: items });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Volunteering */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volunteering</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.volunteer ?? []), { id: crypto.randomUUID(), organization: "", position: "", startDate: "", endDate: "", summary: "" }];
                handleUpdateContent({ ...activeResume.content, volunteer: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {(activeResume.content.volunteer ?? []).map((v, idx) => (
                <div key={v.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const items = [...(activeResume.content.volunteer ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, volunteer: items });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Organization</Label>
                      <Input className="h-7 text-xs" value={v.organization} onChange={(e) => {
                        const items = [...(activeResume.content.volunteer ?? [])];
                        items[idx] = { ...items[idx], organization: e.target.value };
                        handleUpdateContent({ ...activeResume.content, volunteer: items });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Role</Label>
                      <Input className="h-7 text-xs" value={v.position} onChange={(e) => {
                        const items = [...(activeResume.content.volunteer ?? [])];
                        items[idx] = { ...items[idx], position: e.target.value };
                        handleUpdateContent({ ...activeResume.content, volunteer: items });
                      }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Start Date</Label>
                      <Input className="h-7 text-xs" placeholder="Jan 2022" value={v.startDate} onChange={(e) => {
                        const items = [...(activeResume.content.volunteer ?? [])];
                        items[idx] = { ...items[idx], startDate: e.target.value };
                        handleUpdateContent({ ...activeResume.content, volunteer: items });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">End Date</Label>
                      <Input className="h-7 text-xs" placeholder="Present" value={v.endDate} onChange={(e) => {
                        const items = [...(activeResume.content.volunteer ?? [])];
                        items[idx] = { ...items[idx], endDate: e.target.value };
                        handleUpdateContent({ ...activeResume.content, volunteer: items });
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Description</Label>
                    <Textarea className="text-xs" rows={2} value={v.summary} onChange={(e) => {
                      const items = [...(activeResume.content.volunteer ?? [])];
                      items[idx] = { ...items[idx], summary: e.target.value };
                      handleUpdateContent({ ...activeResume.content, volunteer: items });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interests</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.interests ?? []), { id: crypto.randomUUID(), name: "", keywords: "" }];
                handleUpdateContent({ ...activeResume.content, interests: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(activeResume.content.interests ?? []).map((it, idx) => (
                <div key={it.id} className="flex items-center gap-2 group">
                  <Input className="h-7 text-xs w-[38%] shrink-0" placeholder="Photography" value={it.name} onChange={(e) => {
                    const items = [...(activeResume.content.interests ?? [])];
                    items[idx] = { ...items[idx], name: e.target.value };
                    handleUpdateContent({ ...activeResume.content, interests: items });
                  }} />
                  <Input className="h-7 text-xs flex-1 min-w-0" placeholder="film, travel" value={it.keywords ?? ""} onChange={(e) => {
                    const items = [...(activeResume.content.interests ?? [])];
                    items[idx] = { ...items[idx], keywords: e.target.value };
                    handleUpdateContent({ ...activeResume.content, interests: items });
                  }} />
                  <button onClick={() => {
                    const items = [...(activeResume.content.interests ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, interests: items });
                  }} className="text-muted-foreground hover:text-destructive text-xs px-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* References */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">References</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const items = [...(activeResume.content.references ?? []), { id: crypto.randomUUID(), name: "", reference: "" }];
                handleUpdateContent({ ...activeResume.content, references: items });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {(activeResume.content.references ?? []).map((ref, idx) => (
                <div key={ref.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const items = [...(activeResume.content.references ?? [])];
                    items.splice(idx, 1);
                    handleUpdateContent({ ...activeResume.content, references: items });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove
                  </button>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-[11px]">Name & Role</Label>
                    <Input className="h-7 text-xs" placeholder="Jane Smith, CTO at Acme" value={ref.name} onChange={(e) => {
                      const items = [...(activeResume.content.references ?? [])];
                      items[idx] = { ...items[idx], name: e.target.value };
                      handleUpdateContent({ ...activeResume.content, references: items });
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px]">Reference</Label>
                    <Textarea className="text-xs" rows={3} placeholder="What they said about you, or their contact details." value={ref.reference} onChange={(e) => {
                      const items = [...(activeResume.content.references ?? [])];
                      items[idx] = { ...items[idx], reference: e.target.value };
                      handleUpdateContent({ ...activeResume.content, references: items });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Custom Sections */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Sections</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                const sections = [...(activeResume.content.customSections ?? []), { id: crypto.randomUUID(), title: "", items: [] as Array<{ id: string; title?: string; subtitle?: string; date?: string; description?: string }> }];
                handleUpdateContent({ ...activeResume.content, customSections: sections });
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-5">
              {(activeResume.content.customSections ?? []).map((cs, sIdx) => (
                <div key={cs.id} className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
                  <button onClick={() => {
                    const sections = [...(activeResume.content.customSections ?? [])];
                    sections.splice(sIdx, 1);
                    handleUpdateContent({ ...activeResume.content, customSections: sections });
                  }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-xs">
                    Remove section
                  </button>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-[11px]">Section title</Label>
                    <Input className="h-7 text-xs" placeholder="Speaking engagements" value={cs.title} onChange={(e) => {
                      const sections = [...(activeResume.content.customSections ?? [])];
                      sections[sIdx] = { ...sections[sIdx], title: e.target.value };
                      handleUpdateContent({ ...activeResume.content, customSections: sections });
                    }} />
                  </div>
                  <div className="space-y-3 pt-1">
                    {(cs.items ?? []).map((item, iIdx) => (
                      <div key={item.id} className="p-2.5 border rounded-md bg-background space-y-2 relative group/item">
                        <button onClick={() => {
                          const sections = [...(activeResume.content.customSections ?? [])];
                          const items = [...sections[sIdx].items];
                          items.splice(iIdx, 1);
                          sections[sIdx] = { ...sections[sIdx], items };
                          handleUpdateContent({ ...activeResume.content, customSections: sections });
                        }} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 text-[11px]">
                          Remove
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Title</Label>
                            <Input className="h-7 text-xs" value={item.title ?? ""} onChange={(e) => {
                              const sections = [...(activeResume.content.customSections ?? [])];
                              const items = [...sections[sIdx].items];
                              items[iIdx] = { ...items[iIdx], title: e.target.value };
                              sections[sIdx] = { ...sections[sIdx], items };
                              handleUpdateContent({ ...activeResume.content, customSections: sections });
                            }} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Date</Label>
                            <Input className="h-7 text-xs" placeholder="2024" value={item.date ?? ""} onChange={(e) => {
                              const sections = [...(activeResume.content.customSections ?? [])];
                              const items = [...sections[sIdx].items];
                              items[iIdx] = { ...items[iIdx], date: e.target.value };
                              sections[sIdx] = { ...sections[sIdx], items };
                              handleUpdateContent({ ...activeResume.content, customSections: sections });
                            }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Subtitle</Label>
                          <Input className="h-7 text-xs" value={item.subtitle ?? ""} onChange={(e) => {
                            const sections = [...(activeResume.content.customSections ?? [])];
                            const items = [...sections[sIdx].items];
                            items[iIdx] = { ...items[iIdx], subtitle: e.target.value };
                            sections[sIdx] = { ...sections[sIdx], items };
                            handleUpdateContent({ ...activeResume.content, customSections: sections });
                          }} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Description</Label>
                          <Textarea className="text-xs" rows={2} value={item.description ?? ""} onChange={(e) => {
                            const sections = [...(activeResume.content.customSections ?? [])];
                            const items = [...sections[sIdx].items];
                            items[iIdx] = { ...items[iIdx], description: e.target.value };
                            sections[sIdx] = { ...sections[sIdx], items };
                            handleUpdateContent({ ...activeResume.content, customSections: sections });
                          }} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => {
                      const sections = [...(activeResume.content.customSections ?? [])];
                      const items = [...sections[sIdx].items, { id: crypto.randomUUID(), title: "", subtitle: "", date: "", description: "" }];
                      sections[sIdx] = { ...sections[sIdx], items };
                      handleUpdateContent({ ...activeResume.content, customSections: sections });
                    }} className="w-full text-[11px] text-muted-foreground hover:text-foreground border border-dashed rounded-md py-1.5 transition-colors">
                      + Add item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </div>
        </div>
      </div>

      {/* CENTER: Preview Pane */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-muted/20 print:p-0 print:bg-white print:overflow-visible">
        <ResumePreview resume={activeResume.content} />
      </div>

      {/* RIGHT: Design Pane */}
      <div className="w-full md:w-[300px] border-l bg-card flex flex-col h-full z-10 shadow-sm print:hidden">
        <div className="p-4 border-b shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Design</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Template, color &amp; typography</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
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
        </div>
      </div>
    </div>
  );
}

// Compact autosave status pill shown in the editor header.
function SaveStatus({ status }: { status: "saved" | "saving" | "unsaved" }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "unsaved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        Unsaved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <Check className="h-3 w-3 text-emerald-600" />
      Saved
    </span>
  );
}
