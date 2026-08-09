import type { TemplateProps } from "./types";
import { contactLinks, ensureHttp } from "./utils";
import { ExtraSections } from "./ExtraSections";

export function ClassicTemplate({ resume, rootStyle, design, s }: TemplateProps) {
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] p-10 shrink-0 border print:border-none a4-page-breaks"
      style={rootStyle}
    >
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

      {resume.basics.summary && (
        <div style={{ marginBottom: s(1.5) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Professional Summary</h2>
          <p className="text-sm text-[color:var(--text-color)] leading-relaxed whitespace-pre-wrap">{resume.basics.summary}</p>
        </div>
      )}

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

      {resume.skills && resume.skills.length > 0 && (
        <div style={{ marginBottom: s(1.5) }}>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ borderColor: "var(--theme-color)", color: "var(--theme-color)" }}>Skills</h2>
          <div className="flex flex-wrap gap-2 text-sm text-[color:var(--text-color)]">
            {resume.skills.map((sk) => (
              <span key={sk.id} className="bg-muted px-2.5 py-1 rounded-md">{sk.name}</span>
            ))}
          </div>
        </div>
      )}

      <ExtraSections resume={resume} template="classic" color={design.themeColor} sectionMb={s(1.5)} />
    </div>
  );
}
