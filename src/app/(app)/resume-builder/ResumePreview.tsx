import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { resolveFont, googleFontsHref } from "@/lib/resume-fonts";
import { Globe, MonitorSmartphone, PenTool } from "@/components/icons";

function SocialIcon({ label, className }: { label: string; className?: string }) {
  const l = label.toLowerCase();
  
  if (l.includes("github")) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );
  
  if (l.includes("linkedin")) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
  
  if (l.includes("twitter") || l === "x" || l.includes("x (twitter)")) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
  );

  if (l.includes("dribbble")) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.83-16.74 5.85m14.94 10.39c-3.26-6.1-5.75-8.62-11.96-10.87"></path>
    </svg>
  );

  if (l.includes("instagram")) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );

  if (l.includes("youtube")) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  );
  
  if (l.includes("behance") || l.includes("portfolio")) return <MonitorSmartphone className={className} />;
  if (l.includes("medium") || l.includes("dev.to")) return <PenTool className={className} />;
  return <Globe className={className} />;
}

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
  if (template === "elegant") {
    return (
      <h2
        className="text-[11px] font-semibold uppercase tracking-[0.3em] border-b pb-2 mb-4"
        style={{ borderColor: color, color }}
      >
        {children}
      </h2>
    );
  }
  if (template === "compact") {
    return (
      <h2
        className="text-[11px] font-bold uppercase tracking-widest border-b pb-0.5 mb-2"
        style={{ borderColor: color, color }}
      >
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
  const publications = resume.publications ?? [];
  const volunteer = resume.volunteer ?? [];
  const interests = resume.interests ?? [];
  const references = resume.references ?? [];
  const customSections = resume.customSections ?? [];

  return (
    <>
      {projects.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Projects</SectionTitle>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-[color:var(--text-color)]">{p.name || "Project"}</div>
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
                  <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1">
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
                  <div className="font-bold text-[color:var(--text-color)]">{c.name || "Certification"}</div>
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
                  <div className="font-bold text-[color:var(--text-color)]">{a.title || "Award"}</div>
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
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[color:var(--text-color)]">
            {languages.map((l) => (
              <span key={l.id}>
                {l.name}
                {l.fluency ? <span className="text-zinc-400"> — {l.fluency}</span> : null}
              </span>
            ))}
          </div>
        </div>
      )}

      {publications.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Publications</SectionTitle>
          <div className="space-y-2.5">
            {publications.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-[color:var(--text-color)]">
                    {p.url?.trim() ? (
                      <a
                        href={ensureHttp(p.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                        style={{ color }}
                      >
                        {p.name || "Publication"}
                      </a>
                    ) : (
                      p.name || "Publication"
                    )}
                  </div>
                  {p.publisher && <div className="text-sm text-zinc-600">{p.publisher}</div>}
                </div>
                {p.date && (
                  <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">{p.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {volunteer.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Volunteering</SectionTitle>
          <div className="space-y-4">
            {volunteer.map((v) => (
              <div key={v.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-[color:var(--text-color)]">{v.position || "Role"}</div>
                    {v.organization && (
                      <div className="text-sm text-zinc-600">{v.organization}</div>
                    )}
                  </div>
                  {(v.startDate || v.endDate) && (
                    <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">
                      {v.startDate} {v.startDate || v.endDate ? "–" : ""} {v.endDate}
                    </div>
                  )}
                </div>
                {v.summary && (
                  <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1">
                    {v.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {interests.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>Interests</SectionTitle>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[color:var(--text-color)]">
            {interests.map((i) => (
              <span key={i.id}>
                {i.name}
                {i.keywords?.trim() ? (
                  <span className="text-zinc-400"> · {i.keywords}</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      )}

      {references.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <SectionTitle template={template} color={color}>References</SectionTitle>
          <div className="space-y-3">
            {references.map((r) => (
              <div key={r.id}>
                {r.reference && (
                  <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap italic">
                    “{r.reference}”
                  </p>
                )}
                {r.name && (
                  <div className="text-xs text-zinc-500 mt-1">— {r.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {customSections.map((cs) =>
        cs.items.length > 0 ? (
          <div key={cs.id} style={{ marginBottom: sectionMb }}>
            <SectionTitle template={template} color={color}>
              {cs.title || "Section"}
            </SectionTitle>
            <div className="space-y-3">
              {cs.items.map((it) => (
                <div key={it.id}>
                  {(it.title || it.subtitle || it.date) && (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {it.title && (
                          <div className="font-bold text-[color:var(--text-color)]">{it.title}</div>
                        )}
                        {it.subtitle && (
                          <div className="text-sm text-zinc-600">{it.subtitle}</div>
                        )}
                      </div>
                      {it.date && (
                        <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">
                          {it.date}
                        </div>
                      )}
                    </div>
                  )}
                  {it.description && (
                    <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1">
                      {it.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </>
  );
}

function ResumePreviewImpl({ resume }: ResumePreviewProps) {
  const design = resume.design || {
    template: "classic",
    themeColor: "#0f172a",
    fontFamily: "sans",
    spacing: 1,
  };

  const { font, cssFamily } = resolveFont(design.fontFamily);
  const themeColor = design.themeColor || "#0f172a";
  const bgColor = design.backgroundColor || "#ffffff";
  const textColor = design.textColor || "#27272a";

  // Shared root styling: theme/text colors are exposed as CSS variables so
  // nested elements can opt in, while `color` + `backgroundColor` set the
  // page-wide defaults that "ink" text inherits.
  const rootStyle = {
    "--theme-color": themeColor,
    "--text-color": textColor,
    backgroundColor: bgColor,
    color: textColor,
    fontFamily: cssFamily,
  } as React.CSSProperties;

  // Loads the selected Google Font. React 19 hoists <link> tags to <head>
  // and dedupes them by href, so rendering this in each branch is safe.
  const fontLink = (
    <link rel="stylesheet" href={googleFontsHref([font.name])} precedence="resume-font" />
  );

  // Base scaling for margins and paddings
  const s = (val: number) => `${val * design.spacing}rem`;

  if (design.template === "modern") {
    return (
      <div
        id="resume-preview-content"
        className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none flex flex-row a4-page-breaks"
        style={rootStyle}
      >
        {fontLink}
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
            <div className="flex flex-wrap gap-3 mt-4">
              {contactLinks(resume.basics).map((l) => (
                <a key={l.id} href={ensureHttp(l.url)} target="_blank" rel="noreferrer" title={l.label} className="hover:opacity-75 transition-opacity">
                  <SocialIcon label={l.label} className="w-4 h-4" />
                </a>
              ))}
            </div>
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
        <div className="w-[70%] p-8">
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
                        <div className="font-bold text-[color:var(--text-color)]">{work.position || "Position"}</div>
                        <div className="text-sm font-medium" style={{ color: "var(--theme-color)" }}>{work.company || "Company"}</div>
                      </div>
                      <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-1">
                        {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                      </div>
                    </div>
                    <p className="text-xs text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1.5">{work.summary}</p>
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
                        <div className="font-bold text-[color:var(--text-color)]">{ed.institution || "Institution"}</div>
                        <div className="text-sm text-[color:var(--text-color)]">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
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
        className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none p-12 a4-page-breaks"
        style={rootStyle}
      >
        {fontLink}
        <div className="border-l-2 pl-6" style={{ borderColor: "var(--theme-color)" }}>
          <h1 className="text-4xl tracking-tight mb-2 font-light" style={{ color: "var(--theme-color)" }}>{resume.basics.name || "Your Name"}</h1>
          {resume.basics.headline && (
            <div className="text-lg text-zinc-500 mb-4">{resume.basics.headline}</div>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400 mb-10">
            {resume.basics.email && <span>{resume.basics.email}</span>}
            {resume.basics.phone && <span>{resume.basics.phone}</span>}
            {resume.basics.location && <span>{resume.basics.location}</span>}
            <div className="flex gap-3 items-center ml-2">
              {contactLinks(resume.basics).map((l) => (
                <a key={l.id} href={ensureHttp(l.url)} target="_blank" rel="noreferrer" title={l.label} className="hover:text-zinc-600 transition-colors">
                  <SocialIcon label={l.label} className="w-4 h-4" />
                </a>
              ))}
            </div>
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
                      <div className="font-medium text-[color:var(--text-color)] text-lg">{work.position || "Position"} <span className="text-zinc-400 font-normal ml-2">at {work.company || "Company"}</span></div>
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
                      <div className="font-medium text-[color:var(--text-color)]">{ed.institution || "Institution"}</div>
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
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[color:var(--text-color)]">
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

  if (design.template === "professional") {
    return (
      <div
        id="resume-preview-content"
        className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none flex flex-row a4-page-breaks"
        style={rootStyle}
      >
        {fontLink}
        {/* Neutral left rail */}
        <div className="w-[33%] p-7" style={{ backgroundColor: "#f4f4f5" }}>
          <div className="space-y-7">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>Contact</h2>
              <div className="space-y-1.5 text-xs text-zinc-600 break-words">
                {resume.basics.email && <div>{resume.basics.email}</div>}
                {resume.basics.phone && <div>{resume.basics.phone}</div>}
                {resume.basics.location && <div>{resume.basics.location}</div>}
                <div className="flex flex-wrap gap-3 pt-2">
                  {contactLinks(resume.basics).map((l) => (
                    <a key={l.id} href={ensureHttp(l.url)} target="_blank" rel="noreferrer" title={l.label} className="hover:opacity-75 transition-opacity" style={{ color: themeColor }}>
                      <SocialIcon label={l.label} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>Skills</h2>
                <div className="flex flex-col gap-1 text-xs text-[color:var(--text-color)]">
                  {resume.skills.map((sk) => <span key={sk.id}>{sk.name}</span>)}
                </div>
              </div>
            )}
            {resume.languages && resume.languages.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>Languages</h2>
                <div className="flex flex-col gap-1 text-xs text-[color:var(--text-color)]">
                  {resume.languages.map((l) => (
                    <span key={l.id}>{l.name}{l.fluency ? <span className="text-zinc-500"> — {l.fluency}</span> : null}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main column */}
        <div className="w-[67%] p-8">
          <div className="pb-3 mb-5 border-b-2" style={{ borderColor: themeColor }}>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: themeColor }}>{resume.basics.name || "Your Name"}</h1>
            {resume.basics.headline && <div className="text-base text-zinc-500 mt-1">{resume.basics.headline}</div>}
          </div>

          {resume.basics.summary && (
            <div style={{ marginBottom: s(1.5) }}>
              <SectionTitle template="professional" color={themeColor}>Summary</SectionTitle>
              <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
            </div>
          )}

          {resume.work.length > 0 && (
            <div style={{ marginBottom: s(1.5) }}>
              <SectionTitle template="professional" color={themeColor}>Experience</SectionTitle>
              <div className="space-y-5">
                {resume.work.map((work) => (
                  <div key={work.id}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-bold text-[color:var(--text-color)]">{work.position || "Position"}</div>
                        <div className="text-sm font-medium" style={{ color: themeColor }}>{work.company || "Company"}</div>
                      </div>
                      <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">
                        {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                      </div>
                    </div>
                    <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1">{work.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.education.length > 0 && (
            <div style={{ marginBottom: s(1.5) }}>
              <SectionTitle template="professional" color={themeColor}>Education</SectionTitle>
              <div className="space-y-4">
                {resume.education.map((ed) => (
                  <div key={ed.id} className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[color:var(--text-color)]">{ed.institution || "Institution"}</div>
                      <div className="text-sm text-zinc-600">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
                    </div>
                    <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">
                      {ed.startDate} {ed.startDate || ed.endDate ? "–" : ""} {ed.endDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ExtraSections resume={resume} template="professional" color={themeColor} sectionMb={s(1.5)} />
        </div>
      </div>
    );
  }

  if (design.template === "elegant") {
    return (
      <div
        id="resume-preview-content"
        className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none px-14 py-12 a4-page-breaks"
        style={rootStyle}
      >
        {fontLink}
        {/* Centered header */}
        <div className="text-center" style={{ marginBottom: s(2) }}>
          <h1 className="text-4xl tracking-wide mb-2" style={{ color: themeColor }}>{resume.basics.name || "Your Name"}</h1>
          {resume.basics.headline && (
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">{resume.basics.headline}</div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            {resume.basics.email && <span>{resume.basics.email}</span>}
            {resume.basics.phone && <span>· {resume.basics.phone}</span>}
            {resume.basics.location && <span>· {resume.basics.location}</span>}
            <div className="flex items-center gap-3 ml-2 border-l pl-3 border-zinc-300">
              {contactLinks(resume.basics).map((l) => (
                <a key={l.id} href={ensureHttp(l.url)} target="_blank" rel="noreferrer" title={l.label} className="hover:opacity-75 transition-opacity" style={{ color: themeColor }}>
                  <SocialIcon label={l.label} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-5 h-px w-24" style={{ backgroundColor: themeColor }} />
        </div>

        {resume.basics.summary && (
          <div style={{ marginBottom: s(2) }}>
            <SectionTitle template="elegant" color={themeColor}>Profile</SectionTitle>
            <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
          </div>
        )}

        {resume.work.length > 0 && (
          <div style={{ marginBottom: s(2) }}>
            <SectionTitle template="elegant" color={themeColor}>Experience</SectionTitle>
            <div className="space-y-5">
              {resume.work.map((work) => (
                <div key={work.id}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-semibold text-[color:var(--text-color)]">{work.position || "Position"}</div>
                      <div className="text-sm text-zinc-500 italic">{work.company || "Company"}</div>
                    </div>
                    <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">
                      {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                    </div>
                  </div>
                  <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1">{work.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div style={{ marginBottom: s(2) }}>
            <SectionTitle template="elegant" color={themeColor}>Education</SectionTitle>
            <div className="space-y-3">
              {resume.education.map((ed) => (
                <div key={ed.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-[color:var(--text-color)]">{ed.institution || "Institution"}</div>
                    <div className="text-sm text-zinc-500 italic">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
                  </div>
                  <div className="text-xs text-zinc-500 tabular-nums shrink-0 mt-0.5">
                    {ed.startDate} {ed.startDate || ed.endDate ? "–" : ""} {ed.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div style={{ marginBottom: s(2) }}>
            <SectionTitle template="elegant" color={themeColor}>Skills</SectionTitle>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[color:var(--text-color)]">
              {resume.skills.map((sk) => <span key={sk.id}>{sk.name}</span>)}
            </div>
          </div>
        )}

        <ExtraSections resume={resume} template="elegant" color={themeColor} sectionMb={s(2)} />
      </div>
    );
  }

  if (design.template === "compact") {
    return (
      <div
        id="resume-preview-content"
        className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none p-8 text-[13px] a4-page-breaks"
        style={rootStyle}
      >
        {fontLink}
        <div className="flex items-end justify-between gap-4 pb-2 mb-4 border-b-2" style={{ borderColor: themeColor }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColor }}>{resume.basics.name || "Your Name"}</h1>
            {resume.basics.headline && <div className="text-sm text-zinc-600">{resume.basics.headline}</div>}
          </div>
          <div className="text-right text-[11px] text-zinc-500 space-y-0.5 shrink-0">
            {resume.basics.email && <div>{resume.basics.email}</div>}
            {resume.basics.phone && <div>{resume.basics.phone}</div>}
            {resume.basics.location && <div>{resume.basics.location}</div>}
            <div className="flex items-center justify-center gap-4 mt-2">
              {contactLinks(resume.basics).map((l) => (
                <a key={l.id} href={ensureHttp(l.url)} target="_blank" rel="noreferrer" title={l.label} className="hover:opacity-75 transition-opacity" style={{ color: themeColor }}>
                  <SocialIcon label={l.label} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {resume.basics.summary && (
          <div style={{ marginBottom: s(1) }}>
            <SectionTitle template="compact" color={themeColor}>Summary</SectionTitle>
            <p className="text-[13px] text-[color:var(--text-color)] leading-snug whitespace-pre-wrap">{resume.basics.summary}</p>
          </div>
        )}

        {resume.work.length > 0 && (
          <div style={{ marginBottom: s(1) }}>
            <SectionTitle template="compact" color={themeColor}>Experience</SectionTitle>
            <div className="space-y-3">
              {resume.work.map((work) => (
                <div key={work.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-semibold text-[color:var(--text-color)]">
                      {work.position || "Position"}
                      <span className="font-normal text-zinc-500"> · {work.company || "Company"}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 tabular-nums shrink-0">
                      {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                    </div>
                  </div>
                  {work.summary && <p className="text-[12.5px] text-[color:var(--text-color)] leading-snug whitespace-pre-wrap mt-0.5">{work.summary}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div style={{ marginBottom: s(1) }}>
            <SectionTitle template="compact" color={themeColor}>Education</SectionTitle>
            <div className="space-y-2">
              {resume.education.map((ed) => (
                <div key={ed.id} className="flex items-baseline justify-between gap-3">
                  <div className="text-[color:var(--text-color)]">
                    <span className="font-semibold">{ed.institution || "Institution"}</span>
                    <span className="text-zinc-500"> · {ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 tabular-nums shrink-0">
                    {ed.startDate} {ed.startDate || ed.endDate ? "–" : ""} {ed.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div style={{ marginBottom: s(1) }}>
            <SectionTitle template="compact" color={themeColor}>Skills</SectionTitle>
            <div className="flex flex-wrap gap-1.5 text-[12px] text-[color:var(--text-color)]">
              {resume.skills.map((sk) => (
                <span key={sk.id} className="bg-zinc-100 px-2 py-0.5 rounded">{sk.name}</span>
              ))}
            </div>
          </div>
        )}

        <ExtraSections resume={resume} template="compact" color={themeColor} sectionMb={s(1)} />
      </div>
    );
  }

  if (design.template === "split") {
    return (
      <div
        id="resume-preview-content"
        className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none px-12 py-16 text-[12px] leading-relaxed a4-page-breaks"
        style={rootStyle}
      >
        {fontLink}
        
        {/* Header */}
        <div className="flex gap-10 mb-10">
          <div className="w-[160px] shrink-0 font-medium">
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--text-color)] leading-tight">{resume.basics.name || "Your Name"}</h1>
            {resume.basics.headline && <div className="text-[14px] mt-1 text-[color:var(--text-color)]">{resume.basics.headline}</div>}
          </div>
          <div className="flex-1 text-[11px] text-[color:var(--text-color)] space-y-0.5 mt-1">
            {resume.basics.url && <div><a href={ensureHttp(resume.basics.url)} target="_blank" rel="noreferrer" className="hover:underline">{displayUrl(resume.basics.url)}</a></div>}
            {resume.basics.email && <div>{resume.basics.email}</div>}
            {resume.basics.phone && <div>{resume.basics.phone}</div>}
            {resume.basics.location && <div>{resume.basics.location}</div>}
            {resume.basics.links?.map((l) => (
              <div key={l.id}>
                <a href={ensureHttp(l.url)} target="_blank" rel="noreferrer" className="hover:underline">{l.label || displayUrl(l.url)}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {resume.basics.summary && (
          <div className="flex gap-10 mb-8">
            <div className="w-[160px] shrink-0">
              <h2 className="font-bold text-[14px] text-[color:var(--text-color)]">Profile</h2>
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{resume.basics.summary}</p>
            </div>
          </div>
        )}

        {/* Experience */}
        {resume.work.length > 0 && (
          <div className="flex gap-10 mb-8">
            <div className="w-[160px] shrink-0">
              <h2 className="font-bold text-[14px] text-[color:var(--text-color)]">Experience</h2>
            </div>
            <div className="flex-1 space-y-7">
              {resume.work.map((work) => (
                <div key={work.id} className="flex gap-6">
                  <div className="w-[160px] shrink-0">
                    <div className="font-bold text-[13px] text-[color:var(--text-color)]">{work.position || "Position"}</div>
                    <div className="font-bold text-[13px] text-[color:var(--text-color)] mb-1">{work.company || "Company"}</div>
                    <div className="text-[10.5px] text-zinc-500 mb-0.5">{/* location if we had it */}</div>
                    <div className="text-[10.5px] text-zinc-500 tabular-nums">
                      {work.startDate} {work.startDate || work.endDate ? "—" : ""} {work.endDate}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{work.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="flex gap-10 mb-8">
            <div className="w-[160px] shrink-0">
              <h2 className="font-bold text-[14px] text-[color:var(--text-color)]">Education</h2>
            </div>
            <div className="flex-1 space-y-5">
              {resume.education.map((ed) => (
                <div key={ed.id}>
                  <div className="font-bold text-[13px] text-[color:var(--text-color)]">{ed.institution || "Institution"}</div>
                  <div className="text-[12px] text-[color:var(--text-color)] mt-1">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
                  <div className="text-[10.5px] text-zinc-500 tabular-nums mt-1">
                    {ed.startDate} {ed.startDate || ed.endDate ? "—" : ""} {ed.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="flex gap-10 mb-8">
            <div className="w-[160px] shrink-0">
              <h2 className="font-bold text-[14px] text-[color:var(--text-color)]">Skills</h2>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-y-1.5 gap-x-4 text-[11.5px] text-[color:var(--text-color)]">
              {resume.skills.map((sk) => <div key={sk.id}>{sk.name}</div>)}
            </div>
          </div>
        )}

        {/* Fallback Extra Sections (if any) using a simple layout so it doesn't break */}
        <div className="flex gap-10">
          <div className="w-[160px] shrink-0"></div>
          <div className="flex-1">
            <ExtraSections resume={resume} template="compact" color={themeColor} sectionMb={s(1)} />
          </div>
        </div>
      </div>
    );
  }

  // Classic template
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] p-10 shrink-0 border print:border-none a4-page-breaks"
      style={rootStyle}
    >
      {fontLink}
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
          <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
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
                    <div className="font-bold text-[color:var(--text-color)]">{work.position || "Position"}</div>
                    <div className="text-sm text-zinc-600 font-medium">{work.company || "Company"}</div>
                  </div>
                  <div className="text-sm text-zinc-500 tabular-nums shrink-0 mt-0.5">
                    {work.startDate} {work.startDate || work.endDate ? "–" : ""} {work.endDate}
                  </div>
                </div>
                <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap mt-1.5">{work.summary}</p>
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
                    <div className="font-bold text-[color:var(--text-color)]">{ed.institution || "Institution"}</div>
                    <div className="text-sm text-[color:var(--text-color)]">{ed.studyType} {ed.studyType && ed.area ? "in" : ""} {ed.area}</div>
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
          <div className="flex flex-wrap gap-2 text-sm text-[color:var(--text-color)]">
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

// Memoized so editing the resume title (or any sibling state in the builder)
// doesn't re-render the whole preview tree — it only re-renders when the
// resume content object itself changes.
export const ResumePreview = React.memo(ResumePreviewImpl);
