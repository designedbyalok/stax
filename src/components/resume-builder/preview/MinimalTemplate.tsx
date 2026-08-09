import type { TemplateProps } from "./types";
import { contactLinks, ensureHttp } from "./utils";
import { ExtraSections } from "./ExtraSections";
import { SocialIcon } from "./SocialIcon";

export function MinimalTemplate({ resume, rootStyle, design, s }: TemplateProps) {
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none p-12 a4-page-breaks"
      style={rootStyle}
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
              {resume.skills.map((sk) => (
                <span key={sk.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-color)" }}></span>
                  {sk.name}
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
