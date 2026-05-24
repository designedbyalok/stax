"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#product", label: "The board" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav({ user }: { user?: { name?: string | null; email?: string | null } }) {
  const [open, setOpen] = useState(false);

  // Close on hash navigation (smooth-scroll then collapse).
  useEffect(() => {
    if (!open) return;
    function onHash() {
      setOpen(false);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [open]);

  // Lock body scroll while overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="nav-wrap">
        <nav className="nav glass-dark" data-open={open ? "true" : "false"}>
          <Link
            href="/"
            className="nav-logo"
            onClick={() => setOpen(false)}
          >
            <span className="nav-logo-mark">
              <span />
              <span />
              <span />
            </span>
            Stax
          </Link>

          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l.href} className="nav-link" href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          <span className="nav-spacer" />

          {user ? (
            <Link className="nav-signin" href="/board">
              {user.name || user.email?.split("@")[0] || "Dashboard"}
            </Link>
          ) : (
            <>
              <Link className="nav-signin" href="/login">
                Sign in
              </Link>
              <Link className="nav-cta" href="/signup">
                Start tracking
              </Link>
            </>
          )}

          <button
            type="button"
            className="nav-mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-overlay"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="nav-burger" data-open={open}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile full-viewport menu overlay. Renders outside the pill so the
          pill stays compact + stable while the menu fades over the page. */}
      <div
        id="mobile-nav-overlay"
        className="nav-mobile-overlay"
        data-open={open ? "true" : "false"}
        aria-hidden={!open}
        onClick={(e) => {
          // Tap on the empty space dismisses; tap on the inner content doesn't.
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="nav-mobile-overlay-inner">
          <ul className="nav-mobile-list">
            {NAV_LINKS.map((l, i) => (
              <li
                key={l.href}
                style={{ ["--i" as string]: i }}
                className="nav-mobile-item"
              >
                <a href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
            <li
              style={{ ["--i" as string]: NAV_LINKS.length }}
              className="nav-mobile-item nav-mobile-item--signin"
            >
              {user ? (
                <Link href="/board" onClick={() => setOpen(false)}>
                  {user.name || user.email?.split("@")[0] || "Dashboard"}
                </Link>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              )}
            </li>
          </ul>

          {!user && (
            <div
              className="nav-mobile-cta-wrap"
              style={{ ["--i" as string]: NAV_LINKS.length + 1 }}
            >
              <Link
                className="nav-mobile-cta"
                href="/signup"
                onClick={() => setOpen(false)}
              >
                Start tracking →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
