import React from "react";
import { ResumeData } from "@/lib/types/resume";

interface ResumePreviewProps {
  resume: ResumeData;
}

// Ensure a link has a protocol so it's a valid href.
function ensureHttp(url: string): string {
  const u = url.trim();
  if (!u) return "#";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

// Strip protocol + trailing slash for compact display.
function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

// Website (basics.url) + custom links, normalized into one list of
// { label, url } pairs for the contact row.
function contactLinks(basics: ResumeData["basics"]) {
  const out: Array<{ id: string; label: string; url: string }> = [];
  if (basics.url?.trim()) {
    out.push({ id: "__site", label: displayUrl(basics.url), url: basics.url });
  }
  for (const l of basics.links ?? []) {
    if (l.url?.trim()) {
      out.push({ id: l.id, label: l.label?.trim() || displayUrl(l.url), url: l.url });
    }
  }
  return out;
}

// Per-template section heading. Classic + modern use a theme-colored
// underline; minimal uses a muted label.
function SectionTitle({
  template,
  color,
  children,
}: {
  template: string;
  color: string;
  children: React.ReactNode;
}) {
  if (template === "minimal") {
    return (
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
        {children}
      </h2>
    );
  }
  return (
    <h2
      className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4"
      style={{ borderColor: color, color }}
    >
      {children}
    </h2>
  );
}

// Projects / Certifications / Awards / Languages — rendered for any
// template that has data for them. Each section is hidden when empty.
function ExtraSections({
  resume,
  template,
  color,
  sectionMb,
}: {
  resume: ResumeData;
  template: string;
  color: string;
  sectionMb: string;
}) {
  const projects = resume.projects ?? [];
  const certifications = resume.certifications ?? [];
  const awards = resume.awards ?? [];
  const languages = resume.languages ?? [];

  return (
    <>
      {projects.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Projects</SectionTitle>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-zinc-900">{p.name || "Project"}</div>
                  {p.url?.trim() && (
                    <a
                      href={ensureHttp(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs shrink-0 hover:underline mt-0.5"
                      style={{ color }}
                    >
                      {displayUrl(p.url)}
                    </a>
                  )}
                </div>
                {p.description && (
                  <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap mt-1">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Certifications</SectionTitle>
          <div className="space-y-2.5">
            {certifications.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-zinc-900">{c.name || "Certification"}</div>
                  {c.issuer && <div className="text-sm text-zinc-600">{c.issuer}</div>}
                </div>
                {c.date && (
                  <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">{c.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {awards.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Awards</SectionTitle>
          <div className="space-y-2.5">
            {awards.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-zinc-900">{a.title || "Award"}</div>
                  {a.awarder && <div className="text-sm text-zinc-600">{a.awarder}</div>}
                </div>
                {a.date && (
                  <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">{a.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {languages.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Languages</SectionTitle>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-700">
            {languages.map((l) => (
              <span key={l.id}>
                {l.name}
                {l.fluency ? <span className="text-zinc-400"> — {l.fluency}</span> : null}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const design = resume.design || {
    template: "classic",
    themeColor: "#0f172a",
    fontFamily: "sans",
    spacing: 1,
  };

  const getFontClass = () => {
    switch (design.fontFamily) {
      case "serif": return "font-serif";
      case "mono": return "font-mono";
      default: return "font-sans";
    }
  };

  // Base scaling for margins and paddings
  const s = (val: number) => `${val * design.spacing}rem`;

  if (design.template === "modern") {
    return (
      <div 
        id="resume-preview-content" 
        className={`bg-white shadow-2xl print:shadow-none min-h-[1056px] w-[816px] max-w-[816px] shrink-0 text-black border print:border-none flex flex-row ${getFontClass()}`}
        style={{ "--theme-color": design.themeColor } as any}
      >
        {/* Left Sidebar */}
        <div className="w-[30%] text-white p-8" style={{ backgroundColor: "var(--theme-color)" }}>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{resume.basics.name || "Your Name"}</h1>
          {resume.basics.headline && (
            <div className="text-sm opacity-90 mb-8">{resume.basics.headline}</div>
          )}
          
          <div className="space-y-4 text-xs opacity-90 mb-8">
            {resume.basics.email && <div>{resume.basics.email}</div>}
            {resume.basics.phone && <div>{resume.basics.phone}</div>}
            {resume.basics.location && <div>{resume.basics.location}</div>}
            {contactLinks(resume.basics).map((l) => (
              <div key={l.id}>
                <a href={ensureHttp(l.url)} target="_blank" rel="noreferrer" className="hover:underline break-all">
                  {l.label}
                </a>
              </div>
            ))}
          </div>

          {resume.skills && resume.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-white/20 pb-1 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map(s => (
                  <span key={s.id} className="text-xs bg-white/10 px-2 py-1 rounded">{s.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="w-[70%] p-8 bg-white text-zinc-800">
          {resume.basics.summary && (
            <div style={{ marginBottom: s(2) }}>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Profile</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
            </div>
          )}

          {resume.work.length > 0 && (
            <div style={{ marginBottom: s(2) }}>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Experience</h2>
              <div className="space-y-5">
                {resume.work.map((work) => (
                  <div key={work.id}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-bold text-zinc-900">{work.position || "Position"}</div>
                        <div className="text-sm font-medium" style={{ color: "var(--theme-color)" }}>{work.company || "Company"}</div>
                      </div>
                      <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-1">
                        {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap mt-1.5">{work.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Education</h2>
              <div className="space-y-4">
                {resume.education.map((ed) => (
                  <div key={ed.id}>
                    <div className="flex items-start justify-between mb-0.5">
                      <div>
                        <div className="font-bold text-zinc-900">{ed.institution || "Institution"}</div>
                        <div className="text-sm text-zinc-700">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
                      </div>
                      <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-1">
                        {ed.startDate} {ed.startDate || ed.endDate ? "–" : ""} {ed.endDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ExtraSections resume={resume} template="modern" color={design.themeColor} sectionMb={s(2)} />
        </div>
      </div>
    );
  }

  if (design.template === "minimal") {
    return (
      <div 
        id="resume-preview-content" 
        className={`bg-white shadow-2xl print:shadow-none min-h-[1056px] w-[816px] max-w-[816px] shrink-0 text-black border print:border-none p-12 ${getFontClass()}`}
        style={{ "--theme-color": design.themeColor } as any}
      >
        <div className="border-l-2 pl-6" style={{ borderColor: "var(--theme-color)" }}>
          <h1 className="text-4xl tracking-tight mb-2 font-light" style={{ color: "var(--theme-color)" }}>{resume.basics.name || "Your Name"}</h1>
          {resume.basics.headline && (
            <div className="text-lg text-zinc-500 mb-4">{resume.basics.headline}</div>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400 mb-10">
            {resume.basics.email && <span>{resume.basics.email}</span>}
            {resume.basics.phone && <span>{resume.basics.phone}</span>}
            {resume.basics.location && <span>{resume.basics.location}</span>}
            {contactLinks(resume.basics).map((l) => (
              <a key={l.id} href={ensureHttp(l.url)} target="_blank" rel="noreferrer" className="hover:underline hover:text-zinc-600">
                {l.label}
              </a>
            ))}
          </div>

          {resume.basics.summary && (
            <div style={{ marginBottom: s(2.5) }}>
              <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
            </div>
          )}

          {resume.work.length > 0 && (
            <div style={{ marginBottom: s(2.5) }}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Experience</h2>
              <div className="space-y-8">
                {resume.work.map((work) => (
                  <div key={work.id}>
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="font-medium text-zinc-800 text-lg">{work.position || "Position"} <span className="text-zinc-400 font-normal ml-2">at {work.company || "Company"}</span></div>
                      <div className="text-xs text-zinc-400 tabular-nums shrink-0">
                        {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{work.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.education.length > 0 && (
            <div style={{ marginBottom: s(2.5) }}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Education</h2>
              <div className="space-y-6">
                {resume.education.map((ed) => (
                  <div key={ed.id}>
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="font-medium text-zinc-800">{ed.institution || "Institution"}</div>
                      <div className="text-xs text-zinc-400 tabular-nums shrink-0">
                        {ed.startDate} {ed.startDate || ed.endDate ? "–" : ""} {ed.endDate}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-500">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.skills && resume.skills.length > 0 && (
            <div style={{ marginBottom: s(2.5) }}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Skills</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700">
                {resume.skills.map(s => (
                  <span key={s.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-color)" }}></span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ExtraSections resume={resume} template="minimal" color={design.themeColor} sectionMb={s(2.5)} />
        </div>
      </div>
    );
  }

  // Classic template
  return (
    <div 
      id="resume-preview-content" 
      className={`bg-white shadow-2xl print:shadow-none min-h-[1056px] w-[816px] max-w-[816px] p-10 shrink-0 text-black border print:border-none ${getFontClass()}`}
      style={{ "--theme-color": design.themeColor } as any}
    >
      {/* Header */}
      <div className="text-center" style={{ marginBottom: s(1.5) }}>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "var(--theme-color)" }}>{resume.basics.name || "Your Name"}</h1>
        {resume.basics.headline && (
          <div className="text-lg text-zinc-600 mb-3">{resume.basics.headline}</div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-zinc-500 font-medium">
          {resume.basics.email && <span>{resume.basics.email}</span>}
          {resume.basics.phone && <span>• {resume.basics.phone}</span>}
          {resume.basics.location && <span>• {resume.basics.location}</span>}
          {contactLinks(resume.basics).map((l) => (
            <span key={l.id}>
              {"• "}
              <a href={ensureHttp(l.url)} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "var(--theme-color)" }}>
                {l.label}
              </a>
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {resume.basics.summary && (
        <div style={{ marginBottom: s(1.5) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Professional Summary</h2>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.work.length > 0 && (
        <div style={{ marginBottom: s(1.5) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Work Experience</h2>
          <div className="space-y-5">
            {resume.work.map((work) => (
              <div key={work.id}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-bold text-zinc-900">{work.position || "Position"}</div>
                    <div className="text-sm text-zinc-600 font-medium">{work.company || "Company"}</div>
                  </div>
                  <div className="text-sm text-zinc-500 tabular-nums shrink-0 mt-0.5">
                    {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                  </div>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap mt-1.5">{work.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div style={{ marginBottom: s(1.5) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Education</h2>
          <div className="space-y-4">
            {resume.education.map((ed) => (
              <div key={ed.id}>
                <div className="flex items-start justify-between mb-0.5">
                  <div>
                    <div className="font-bold text-zinc-900">{ed.institution || "Institution"}</div>
                    <div className="text-sm text-zinc-700">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
                  </div>
                  <div className="text-sm text-zinc-500 tabular-nums shrink-0 mt-0.5">
                    {ed.startDate} {ed.startDate || ed.endDate ? "–" : ""} {ed.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div style={{ marginBottom: s(1.5) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Skills</h2>
          <div className="flex flex-wrap gap-2 text-sm text-zinc-700">
            {resume.skills.map(s => (
              <span key={s.id} className="bg-muted px-2.5 py-1 rounded-md">{s.name}</span>
            ))}
          </div>
        </div>
      )}

      <ExtraSections resume={resume} template="classic" color={design.themeColor} sectionMb={s(1.5)} />
    </div>
  );
}
