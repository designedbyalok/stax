"use client";

import { useState } from "react";

type Card = {
  id: string;
  col: string;
  role: string;
  co: string;
  loc: string;
  age: string;
  logo: string;
  color: string;
  stale?: boolean;
  fresh?: boolean;
};

const SAMPLE_CARDS: Card[] = [
  { id: "c1", col: "saved", role: "Senior Product Designer", co: "Linear", loc: "Remote", age: "2d", logo: "L", color: "#5e6ad2" },
  { id: "c2", col: "saved", role: "Staff Engineer, Infra", co: "Replit", loc: "SF / Remote", age: "3d", logo: "R", color: "#f26207" },
  { id: "c3", col: "applied", role: "Product Manager", co: "Vercel", loc: "Remote", age: "9d", logo: "V", color: "#1a1814", stale: true },
  { id: "c4", col: "applied", role: "Design Engineer", co: "Ramp", loc: "New York", age: "4d", logo: "R", color: "#3a8d6c" },
  { id: "c5", col: "applied", role: "Brand Designer", co: "Arc", loc: "NYC", age: "1d", logo: "A", color: "#a86b4f" },
  { id: "c6", col: "phone", role: "Sr. PM, Growth", co: "Notion", loc: "Remote", age: "5d", logo: "N", color: "#1a1814" },
  { id: "c7", col: "phone", role: "Frontend Engineer", co: "Stripe", loc: "Remote", age: "2d", logo: "S", color: "#6259ca" },
  { id: "c8", col: "interview", role: "Head of Design", co: "Cursor", loc: "SF", age: "3d", logo: "C", color: "#1a1814" },
  { id: "c9", col: "interview", role: "Product Engineer", co: "Figma", loc: "Remote", age: "1d", logo: "F", color: "#a259ff" },
  { id: "c10", col: "offer", role: "Design Lead", co: "Mercury", loc: "Remote", age: "6h", logo: "M", color: "#5b4fc4" },
];

const COLS = [
  { id: "saved", name: "Saved", dot: "saved" },
  { id: "applied", name: "Applied", dot: "applied" },
  { id: "phone", name: "Phone Screen", dot: "phone" },
  { id: "interview", name: "Interview", dot: "interview" },
  { id: "offer", name: "Offer", dot: "offer" },
];

export function MiniKanban() {
  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [phase, setPhase] = useState<"reading" | "pulling" | "ready" | null>(null);

  function handlePaste() {
    if (phase) return;
    setPhase("reading");
    setTimeout(() => setPhase("pulling"), 700);
    setTimeout(() => {
      setPhase("ready");
      setCards((c) => [
        {
          id: "new-" + Date.now(),
          col: "saved",
          role: "Senior Software Engineer",
          co: "Anthropic",
          loc: "SF / Remote",
          age: "now",
          logo: "A",
          color: "#c25a2e",
          fresh: true,
        },
        ...c,
      ]);
      setPasteText("");
      setTimeout(() => setPhase(null), 1800);
    }, 1500);
  }

  function onDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragEnd() {
    setDragId(null);
    setDropCol(null);
  }
  function onColDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    if (dropCol !== colId) setDropCol(colId);
  }
  function onColDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    if (dragId) {
      setCards((cs) => cs.map((c) => (c.id === dragId ? { ...c, col: colId } : c)));
    }
    setDragId(null);
    setDropCol(null);
  }

  return (
    <div>
      <div className="paste-bar glass-light">
        <svg
          className="paste-bar-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <input
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={
            phase === "reading"
              ? "Reading the job posting…"
              : phase === "pulling"
              ? "Pulling out details…"
              : phase === "ready"
              ? "Saved to your board ✓"
              : "Paste a job URL — LinkedIn, Greenhouse, Lever, Workday…"
          }
          disabled={!!phase}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePaste();
          }}
        />
        <button className="paste-bar-go" onClick={handlePaste}>
          {phase ? "…" : "Try it"}
        </button>
      </div>

      <div className="kanban">
        {COLS.map((col) => {
          const colCards = cards.filter((c) => c.col === col.id);
          return (
            <div
              key={col.id}
              className={"col" + (dropCol === col.id ? " drop-target" : "")}
              onDragOver={(e) => onColDragOver(e, col.id)}
              onDragLeave={() => setDropCol(null)}
              onDrop={(e) => onColDrop(e, col.id)}
              style={{ height: 497 }}
            >
              <div className="col-head">
                <div className="col-name">
                  <span className={"col-dot " + col.dot} />
                  {col.name}
                </div>
                <div className="col-count">{colCards.length}</div>
              </div>
              {colCards.map((c) => (
                <div
                  key={c.id}
                  className={
                    "card" +
                    (dragId === c.id ? " dragging" : "") +
                    (c.fresh ? " fresh" : "")
                  }
                  draggable
                  onDragStart={(e) => onDragStart(e, c.id)}
                  onDragEnd={onDragEnd}
                >
                  <div className="card-head">
                    <div className="logo" style={{ background: c.color }}>
                      {c.logo}
                    </div>
                    <div className="card-meta">
                      <div className="card-role">{c.role}</div>
                      <div className="card-co">{c.co}</div>
                    </div>
                  </div>
                  <div className="card-foot">
                    <div className="card-loc">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {c.loc}
                    </div>
                    <div className={c.stale ? "stale" : ""}>
                      {c.stale ? "Follow up · " : ""}
                      {c.age}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
