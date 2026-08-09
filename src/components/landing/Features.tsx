"use client";

import { useEffect, useState } from "react";

function useTick(intervalMs: number, count: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, count]);
  return tick;
}

const CARD_NEXT_ACTIONS = [
  "Follow up w/ Sarah · Fri",
  "Send portfolio · Mon",
  "Reply to recruiter · Thu",
  "Schedule onsite · Tue",
];

const DIGEST_ROWS = [
  { co: "Vercel", role: "Product Manager", days: "9d silent", color: "#1a1814" },
  { co: "Notion", role: "Sr. PM, Growth", days: "5d silent", color: "#1a1814" },
  { co: "Stripe", role: "Frontend Eng.", days: "7d silent", color: "#6259ca" },
];

function CaptureMini() {
  const phase = useTick(1200, 5);
  const FULL_URL = "linear.app/careers/senior-designer";
  const url = phase >= 1 ? FULL_URL : "";
  const showStatus = phase >= 2;
  const showCard = phase >= 3;

  return (
    <div
      className="mini"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 14,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 10px",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "var(--font-jetbrains-mono), monospace",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "var(--ink-mute)" }}
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span
          style={{
            color: "var(--ink)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url || <span style={{ color: "var(--ink-mute)" }}>paste a job URL…</span>}
          {phase === 0 && <span className="mini-caret">|</span>}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 10,
          color: "var(--ink-mute)",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          marginTop: 12,
          height: 12,
          opacity: showStatus && !showCard ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <span className="mini-dot" />
        Reading the job posting…
      </div>

      <div
        className={"mini-card" + (showCard ? " in" : "")}
        style={{
          marginTop: showStatus ? 8 : 12,
          padding: 10,
          background: "var(--paper)",
          borderRadius: 8,
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: "#5e6ad2",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontSize: 12,
              fontFamily: "var(--font-playfair-display), serif",
              flexShrink: 0,
            }}
          >
            L
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Senior Designer</div>
            <div style={{ fontSize: 10, color: "var(--ink-mute)" }}>
              Linear · Remote · <span style={{ color: "#4a9b6b" }}>✓ parsed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardMini() {
  const idx = useTick(2200, CARD_NEXT_ACTIONS.length);
  return (
    <div
      className="mini"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "#3a8d6c",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontFamily: "var(--font-playfair-display), serif",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          R
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Design Engineer · Ramp</div>
          <div style={{ fontSize: 10, color: "var(--ink-mute)" }}>via Greenhouse</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 6, fontSize: 11 }}>
        <div
          className="mini-row mini-row-active"
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 8px",
            borderRadius: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span style={{ color: "var(--ink-mute)" }}>Next</span>
          <span key={CARD_NEXT_ACTIONS[idx]} className="mini-row-value">
            {CARD_NEXT_ACTIONS[idx]}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--paper)",
            borderRadius: 6,
          }}
        >
          <span style={{ color: "var(--ink-mute)" }}>Resume</span>
          <span>v3 — IC-focused</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--paper)",
            borderRadius: 6,
          }}
        >
          <span style={{ color: "var(--ink-mute)" }}>Contacts</span>
          <span>Sarah K. · Recruiter</span>
        </div>
      </div>
    </div>
  );
}

function DigestMini() {
  const phase = useTick(900, 5);
  return (
    <div
      className="mini"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 14,
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div style={{ fontFamily: "var(--font-playfair-display), serif", fontSize: 18 }}>
          Monday, 9:00am
        </div>
        <div
          className={"mini-badge" + (phase >= 4 ? " pulse" : "")}
          style={{
            fontSize: 9,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            color: "var(--accent)",
            padding: "2px 6px",
            borderRadius: 999,
            border:
              "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
          }}
        >
          NEW
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 10 }}>
        3 follow-ups due this week
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {DIGEST_ROWS.map((r, i) => (
          <div
            key={`${r.co}-${r.role}`}
            className={"mini-digest-row" + (phase > i ? " in" : "")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 8px",
              background: "var(--paper)",
              borderRadius: 6,
              fontSize: 11,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: r.color,
                color: "white",
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                fontFamily: "var(--font-playfair-display), serif",
                flexShrink: 0,
              }}
            >
              {r.co[0]}
            </div>
            <div
              style={{
                flex: 1,
                fontWeight: 600,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.role}
            </div>
            <div
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                flexShrink: 0,
              }}
            >
              {r.days}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  return (
    <div className="section" id="features">
      <div className="container">
        <div className="reveal">
          <div className="section-eyebrow">{"// what's inside"}</div>
          <h2 className="section-title">
            A whole workspace, hiding in <em>one card.</em>
          </h2>
          <p className="section-sub">
            Every application is a single source of truth: the link, the people, the
            resume version, the notes, the timeline.
          </p>
        </div>

        <div className="feature-grid reveal-stagger">
          <div className="feature">
            <div className="feature-tag">{"// capture"}</div>
            <h3>
              Paste once.
              <br />
              Tracked forever.
            </h3>
            <p>
              Drop in any job URL — our parsers handle the top five platforms cleanly,
              and fall back to a friendly manual form when a site fights back.
            </p>
            <div className="feature-visual">
              <CaptureMini />
            </div>
          </div>

          <div className="feature">
            <div className="feature-tag">{"// workspace"}</div>
            <h3>The card is a workspace, not a row.</h3>
            <p>
              Contacts, timeline, resume version, next action — all inline-editable.
              No modals, no nested screens, no save buttons.
            </p>
            <div className="feature-visual">
              <CardMini />
            </div>
          </div>

          <div className="feature">
            <div className="feature-tag">{"// follow-up"}</div>
            <h3>Never let a lead go cold.</h3>
            <p>
              A weekly Monday digest surfaces the applications that have gone quiet.
              Snooze, dismiss, or follow up — in two clicks.
            </p>
            <div className="feature-visual">
              <DigestMini />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
