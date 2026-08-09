import { ResumeData } from "./types/resume";

// Utility to escape LaTeX special characters
function escapeLatex(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function generateLatex(resume: ResumeData): string {
  const { basics, work, education, skills, projects, certifications } = resume;

  let latex = `\\documentclass[11pt,a4paper,sans]{moderncv}

% moderncv themes
\\moderncvstyle{classic} % style options are 'casual', 'classic', 'oldstyle' and 'banking'
\\moderncvcolor{blue} % color options 'blue', 'orange', 'green', 'red', 'purple', 'grey' and 'black'

\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.85]{geometry}
\\usepackage{enumitem}

% Personal data
\\name{${escapeLatex(basics.name.split(" ")[0] || "")}}{${escapeLatex(
    basics.name.split(" ").slice(1).join(" ") || ""
  )}}
`;

  if (basics.headline) {
    latex += `\\title{${escapeLatex(basics.headline)}}\n`;
  }
  if (basics.phone) {
    latex += `\\phone[mobile]{${escapeLatex(basics.phone)}}\n`;
  }
  if (basics.email) {
    latex += `\\email{${escapeLatex(basics.email)}}\n`;
  }
  if (basics.url) {
    // extract just the domain/path for display if needed
    latex += `\\homepage{${escapeLatex(
      basics.url.replace(/^https?:\/\//, "")
    )}}\n`;
  }
  
  if (basics.links && basics.links.length > 0) {
    for (const link of basics.links) {
      const urlClean = link.url.replace(/^https?:\/\//, "");
      if (link.label.toLowerCase().includes("linkedin")) {
        latex += `\\social[linkedin]{${escapeLatex(urlClean.replace(/.*linkedin\.com\/in\//, ""))}}\n`;
      } else if (link.label.toLowerCase().includes("github")) {
        latex += `\\social[github]{${escapeLatex(urlClean.replace(/.*github\.com\//, ""))}}\n`;
      } else if (link.label.toLowerCase().includes("twitter") || link.label.toLowerCase() === "x") {
        latex += `\\social[twitter]{${escapeLatex(urlClean.replace(/.*x\.com\//, "").replace(/.*twitter\.com\//, ""))}}\n`;
      } else {
        // generic fallback
        latex += `\\extrainfo{${escapeLatex(link.label)}: \\url{${escapeLatex(link.url)}}}\n`;
      }
    }
  }

  if (basics.location) {
    latex += `\\address{${escapeLatex(basics.location)}}{}{}\n`;
  }

  latex += `
\\begin{document}
\\makecvtitle

`;

  if (basics.summary) {
    latex += `\\section{Profile}\n${escapeLatex(basics.summary)}\\vspace{1em}\n\n`;
  }

  if (work && work.length > 0) {
    latex += `\\section{Experience}\n`;
    for (const w of work) {
      latex += `\\cventry{${escapeLatex(w.startDate)} -- ${escapeLatex(
        w.endDate || "Present"
      )}}{${escapeLatex(w.position)}}{${escapeLatex(
        w.company
      )}}{}{}{${escapeLatex(w.summary)}}\n`;
    }
  }

  if (education && education.length > 0) {
    latex += `\\section{Education}\n`;
    for (const e of education) {
      latex += `\\cventry{${escapeLatex(e.startDate)} -- ${escapeLatex(
        e.endDate || "Present"
      )}}{${escapeLatex(e.studyType)} ${
        e.area ? "in " + escapeLatex(e.area) : ""
      }}{${escapeLatex(e.institution)}}{}{}{}\n`;
    }
  }

  if (skills && skills.length > 0) {
    latex += `\\section{Skills}\n`;
    const skillNames = skills.map((s) => escapeLatex(s.name));
    // Group skills 4 by 4 or just list them
    latex += `\\cvitem{}{\\begin{itemize}[label=\\textbullet, leftmargin=*, noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt]
`;
    for (const s of skillNames) {
      latex += `  \\item ${s}\n`;
    }
    latex += `\\end{itemize}}\n`;
  }

  if (projects && projects.length > 0) {
    latex += `\\section{Projects}\n`;
    for (const p of projects) {
      latex += `\\cvitem{\\textbf{${escapeLatex(p.name)}}}{${
        p.url ? "\\url{" + escapeLatex(p.url) + "} - " : ""
      }${escapeLatex(p.description)}}\n`;
    }
  }
  
  if (certifications && certifications.length > 0) {
    latex += `\\section{Certifications}\n`;
    for (const c of certifications) {
      latex += `\\cvitem{${escapeLatex(c.date)}}{${escapeLatex(c.name)} - \\textit{${escapeLatex(c.issuer)}}}\n`;
    }
  }

  latex += `\\end{document}\n`;

  return latex;
}
