import type { TemplateProps } from "./types";
import { contactLinks, ensureHttp } from "./utils";
import { ExtraSections } from "./ExtraSections";
import { SectionTitle } from "./SectionTitle";
import { SocialIcon } from "./SocialIcon";

export function CompactTemplate({ resume, rootStyle, themeColor, s }: TemplateProps) {
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none p-8 text-[13px] a4-page-breaks"
      style={rootStyle}
    >
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
