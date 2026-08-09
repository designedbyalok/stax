import type { TemplateProps } from "./types";
import { contactLinks, ensureHttp } from "./utils";
import { ExtraSections } from "./ExtraSections";
import { SocialIcon } from "./SocialIcon";

export function ModernTemplate({ resume, rootStyle, design, s }: TemplateProps) {
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none flex flex-row a4-page-breaks"
      style={rootStyle}
    >
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
              {resume.skills.map((sk) => (
                <span key={sk.id} className="text-xs bg-white/10 px-2 py-1 rounded">{sk.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

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
