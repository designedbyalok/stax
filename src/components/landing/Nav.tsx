"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#product", label: "The board" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  // Close panel when a hash link is tapped.
  useEffect(() => {
    if (!open) return;
    function onHash() {
      setOpen(false);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [open]);

  // Prevent body scroll while the panel is open on mobile.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="nav-wrap">
      <nav
        className={"nav glass-dark" + (open ? " nav--open" : "")}
        data-open={open ? "true" : "false"}
      >
        <div className="nav-row">
          <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
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

          <Link className="nav-signin" href="/login">
            Sign in
          </Link>
          <Link className="nav-cta" href="/signup">
            Start tracking
          </Link>

          <button
            type="button"
            className="nav-mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="nav-burger" data-open={open}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <div className="nav-mobile-panel" aria-hidden={!open}>
          <div className="nav-mobile-links">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                className="nav-mobile-link"
                href={l.href}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              className="nav-mobile-link nav-mobile-link--signin"
              href="/login"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
