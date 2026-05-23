import { PaintedScene } from "./PaintedScene";
import { MiniKanban } from "./MiniKanban";

export function Hero() {
  return (
    <header className="hero">
      <div className="hero-scene">
        <PaintedScene />
      </div>

      <div className="hero-overlay">
        <div className="hero-eyebrow glass-dark">
          <span className="hero-eyebrow-badge">NEW</span>
          stax · the calm job tracker
        </div>
        <h1 className="serif hero-headline">
          Every job,
          <br />
          <em className="italic">in its place.</em>
        </h1>
        <p className="hero-sub">
          A single-canvas tracker for everywhere you&apos;ve applied. Paste a link, drag a card.
          We&apos;ll keep the rest tidy.
        </p>
        <div className="hero-cta-row">
          <form
            className="email-pill glass-light"
            action="/signup"
            method="get"
          >
            <input type="email" name="email" placeholder="you@somewhere-good.com" />
            <button type="submit">Join the beta</button>
          </form>
        </div>
        <div className="hero-foot">
          <span className="hero-foot-dot" />
          Closed beta · invites going out weekly
        </div>
      </div>

      <div className="hero-kanban-wrap">
        <div className="showcase glass-light">
          <div className="browser-bar">
            <div className="browser-dots">
              <span />
              <span />
              <span />
            </div>

            <div className="browser-tool-group">
              <button className="browser-tool" aria-label="Sidebar" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16" />
                </svg>
              </button>
              <button className="browser-tool" aria-label="Tab overview" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
              </button>
            </div>

            <div className="browser-tool-divider" />

            <div className="browser-tool-group">
              <button className="browser-tool" aria-label="Back" type="button">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button className="browser-tool" aria-label="Forward" disabled type="button">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="browser-tab">
              <span className="browser-tab-favicon">S</span>
              <span className="browser-tab-title">Stax · Board</span>
            </div>

            <div className="browser-url">
              <button className="browser-url-aA" aria-label="Reader settings" type="button">
                <span style={{ fontSize: 10 }}>A</span>
                <span>A</span>
              </button>
              <div className="browser-url-text">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="11" x="4" y="11" rx="2" ry="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <span className="url-host">jobstax.com</span>
                <span className="url-path">/board/lina</span>
              </div>
              <button className="browser-url-refresh" aria-label="Refresh" type="button">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            </div>

            <div className="browser-actions">
              <button className="browser-tool" aria-label="Extensions" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 4V2a2 2 0 0 0-4 0v2H6a2 2 0 0 0-2 2v4H2a2 2 0 0 0 0 4h2v4a2 2 0 0 0 2 2h4v-2a2 2 0 1 1 4 0v2h4a2 2 0 0 0 2-2v-4h2a2 2 0 0 0 0-4h-2V6a2 2 0 0 0-2-2z" />
                </svg>
              </button>
              <button className="browser-tool" aria-label="Share" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v13" />
                  <path d="m16 6-4-4-4 4" />
                  <path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                </svg>
              </button>
              <button className="browser-tool" aria-label="Add tab" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>
            </div>
          </div>
          <div className="showcase-body">
            <MiniKanban />
          </div>
        </div>
      </div>
    </header>
  );
}

