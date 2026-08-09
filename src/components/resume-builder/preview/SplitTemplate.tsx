import type { TemplateProps } from "./types";
import { displayUrl, ensureHttp } from "./utils";
import { ExtraSections } from "./ExtraSections";

export function SplitTemplate({ resume, rootStyle, themeColor, s }: TemplateProps) {
  return (
    <div
      id="resume-preview-content"
      className="shadow-2xl print:shadow-none min-h-[1123px] w-[794px] max-w-[794px] shrink-0 border print:border-none px-12 py-16 text-[12px] leading-relaxed a4-page-breaks"
      style={rootStyle}
    >
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

      <div className="flex gap-10">
        <div className="w-[160px] shrink-0"></div>
        <div className="flex-1">
          <ExtraSections resume={resume} template="compact" color={themeColor} sectionMb={s(1)} />
        </div>
      </div>
    </div>
  );
}
