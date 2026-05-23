const TRUSTED_LOGOS = [
  { name: "Linear", style: "sans" },
  { name: "Vercel", style: "sans" },
  { name: "Mercury", style: "serif" },
  { name: "Notion", style: "sans" },
  { name: "Ramp", style: "sans" },
  { name: "Figma", style: "serif" },
  { name: "Anthropic", style: "sans" },
  { name: "Stripe", style: "sans" },
  { name: "Replit", style: "sans" },
  { name: "Cursor", style: "sans" },
  { name: "Arc", style: "serif" },
  { name: "OpenAI", style: "sans" },
];

export function TrustedBy() {
  const loop = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS];
  return (
    <div className="trusted">
      <div className="trusted-inner">
        <div className="trusted-label">Used by job seekers from</div>
        <div className="trusted-marquee">
          <div className="trusted-track">
            {loop.map((l, i) => (
              <div
                key={i}
                className={"trusted-logo" + (l.style === "serif" ? " serif" : "")}
              >
                {l.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Stats() {
  const items = [
    { num: "10s", label: "from paste to saved card", em: true },
    { num: "5", label: "platforms parsed out of the box", em: false },
    { num: "0", label: "modals between you and your next move", em: false },
    { num: "1", label: "place for every application", em: true },
  ];
  return (
    <div className="container">
      <div className="stats reveal-stagger">
        {items.map((it, i) => (
          <div key={i}>
            <div className="stat-num" data-countup>
              {it.em ? <em>{it.num}</em> : it.num}
            </div>
            <div className="stat-label">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <div className="section" id="product">
      <div className="container">
        <div className="reveal">
          <div className="section-eyebrow">{"// the board"}</div>
          <h2 className="section-title">
            Your pipeline, <em>at a glance.</em>
          </h2>
          <p className="section-sub">
            Paste a link and a card appears. Drag it across columns as the conversation
            moves. The board is the whole product — no setup, no schema, no fields to
            define.
          </p>
        </div>

        <div className="showcase-callouts reveal-stagger">
          <div className="callout">
            <div className="callout-num">01</div>
            <h4>Paste anything.</h4>
            <p>
              LinkedIn, Greenhouse, Lever, Workday, Indeed — or a link from a friend.
              We pull title, company, location, salary. You review and save.
            </p>
          </div>
          <div className="callout">
            <div className="callout-num">02</div>
            <h4>Drag, don&apos;t edit.</h4>
            <p>
              Status changes are a gesture, not a form. Drop a card into Interview and
              the timeline writes itself.
            </p>
          </div>
          <div className="callout">
            <div className="callout-num">03</div>
            <h4>Spot the silent ones.</h4>
            <p>
              Cards in Applied for seven days get a quiet nudge in the corner. No
              notification spam — just signal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <div className="section" style={{ background: "var(--bg-soft)" }} id="how">
      <div className="container">
        <div className="reveal">
          <div className="section-eyebrow">{"// how it works"}</div>
          <h2 className="section-title">
            Three habits, one <em>quiet board.</em>
          </h2>
        </div>

        <div className="steps reveal-stagger">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Paste a link.</h4>
            <p>
              From wherever you found it. A card appears in{" "}
              <span className="mono">Saved</span> with the parts that matter. Edit
              anything inline.
            </p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>Drag as it moves.</h4>
            <p>
              Applied. Phone screen. Interview. Offer. Each move writes a timestamp,
              so future-you knows exactly when.
            </p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Open the digest on Monday.</h4>
            <p>
              One email. The applications that have gone quiet, ready to be nudged. No
              pings. No anxiety. Just signal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
