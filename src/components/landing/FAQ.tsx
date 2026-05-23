"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Do you parse LinkedIn?",
    a: "We do — though LinkedIn is hostile to scrapers, so we degrade gracefully. If we can't fetch the page cleanly, we hand you a pre-filled manual form so you're never blocked. The rest of the top five (Greenhouse, Lever, Workday, Indeed) parse cleanly.",
  },
  {
    q: "Will you spam me with notifications?",
    a: "No. We send one email a week, every Monday at 9am local time, with a digest of applications that have gone quiet. That's it. No per-card pings, no nags, no FOMO. You can turn the digest off entirely in settings.",
  },
  {
    q: "Can I bulk-import from a spreadsheet?",
    a: "Not in v1. You can paste links one at a time, or create a card manually with just a company and role. CSV import is on the roadmap.",
  },
  {
    q: "Is there a mobile app?",
    a: "Stax works on mobile as a read-mostly experience — see your board, get reminders, jot a quick note. Drag-and-drop kanban is desktop-only in v1.",
  },
  {
    q: "Who can see my cards?",
    a: "Only you. Stax is single-user — no teams, no sharing, no surfaces where another human could see your search. Your data is never used to train models.",
  },
  {
    q: "What does it cost?",
    a: "Free during the beta. We'll announce pricing before any paid plan ships, and current users will keep a generous free tier.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="section" id="faq">
      <div className="container">
        <div className="reveal">
          <div className="section-eyebrow">// questions</div>
          <h2 className="section-title">
            A few <em>honest</em> answers.
          </h2>
        </div>
        <div className="faq reveal">
          {FAQS.map((item, i) => (
            <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? -1 : i)}
                type="button"
              >
                <span>{item.q}</span>
                <span className="faq-q-icon">+</span>
              </button>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
