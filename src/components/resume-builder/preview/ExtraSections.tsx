import type { ResumeData } from "@/lib/types/resume";
import { ensureHttp, displayUrl } from "./utils";
import { SectionTitle } from "./SectionTitle";

export function ExtraSections({
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
