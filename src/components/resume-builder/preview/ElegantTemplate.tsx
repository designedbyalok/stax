import type { TemplateProps } from "./types";
import { contactLinks, ensureHttp } from "./utils";
import { ExtraSections } from "./ExtraSections";
import { SectionTitle } from "./SectionTitle";
import { SocialIcon } from "./SocialIcon";

export function ElegantTemplate({ resume, rootStyle, themeColor, s }: TemplateProps) {
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none px-14 py-12 a4-page-breaks"
      style={rootStyle}
    >
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
