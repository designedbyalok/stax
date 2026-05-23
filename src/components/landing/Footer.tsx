"use client";

import { useEffect, useRef } from "react";

export function Footer() {
  const wmRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wm = wmRef.current;
    const layer = layerRef.current;
    if (!wm || !layer) return;

    let lastSparkle = 0;
    const SPARKLE_THROTTLE = 70;

    function onMove(e: PointerEvent) {
      if (!wm || !layer) return;
      const rect = wm.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      wm.style.setProperty("--mx", x + "px");
      wm.style.setProperty("--my", y + "px");

      const now = performance.now();
      if (now - lastSparkle > SPARKLE_THROTTLE) {
        lastSparkle = now;
        spawnSparkle(layer, x, y);
      }
    }

    function onLeave() {
      if (!wm) return;
      wm.style.setProperty("--mx", "-400px");
      wm.style.setProperty("--my", "-400px");
    }

    function spawnSparkle(parent: HTMLElement, x: number, y: number) {
      const s = document.createElement("span");
      const isStar = Math.random() < 0.5;
      s.className = "sparkle" + (isStar ? " star" : "");
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 70;
      const jx = x + Math.cos(angle) * radius;
      const jy = y + Math.sin(angle) * radius;
      s.style.left = jx + "px";
      s.style.top = jy + "px";
      s.style.setProperty("--rot", Math.random() * 360 + "deg");
      s.style.setProperty("--dur", 700 + Math.random() * 700 + "ms");
      s.style.setProperty("--drift", -15 - Math.random() * 25 + "px");
      const scale = 0.6 + Math.random() * 0.9;
      s.style.fontSize = scale + "em";
      parent.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }

    wm.addEventListener("pointermove", onMove);
    wm.addEventListener("pointerleave", onLeave);
    return () => {
      wm.removeEventListener("pointermove", onMove);
      wm.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <span className="nav-logo-mark">
              <span />
              <span />
              <span />
            </span>
            Stax
          </div>
          <h4>
            Every job, <em>in its place.</em>
          </h4>
          <div
            style={{
              fontSize: 13,
              color: "rgba(244,236,223,0.55)",
              lineHeight: 1.6,
              maxWidth: 280,
            }}
          >
            A calm, single-canvas tracker for job seekers. Currently in closed beta.
          </div>
        </div>

        <div className="footer-col">
          <h5>{"// product"}</h5>
          <ul>
            <li>
              <a href="#product">The board</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#how">How it works</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a href="#">Changelog</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>{"// company"}</h5>
          <ul>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Manifesto</a>
            </li>
            <li>
              <a href="#">Press kit</a>
            </li>
            <li>
              <a href="mailto:hello@designedbyalok.com">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>{"// elsewhere"}</h5>
          <ul>
            <li>
              <a href="#">X / Twitter</a>
            </li>
            <li>
              <a href="#">LinkedIn</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-meta">
        <div className="mono">© 2026 · designedbyalok.com · all rights reserved</div>
        <div className="footer-love">
          <em>Designed with</em>
          <span className="footer-heart" aria-hidden>
            ♥
          </span>
          <em>in</em>
          <strong>Pune, India</strong>
        </div>
      </div>

      <div className="footer-wordmark" ref={wmRef} aria-hidden>
        <div className="footer-sparkle-layer" ref={layerRef} />
        Stax<em>.</em>
      </div>
    </footer>
  );
}
