"use client";

import { useEffect } from "react";

/**
 * Mounts scroll-reveal observers and a count-up animation for [data-countup]
 * elements inside the .landing-page wrapper. Idempotent — re-runs on route
 * changes won't double-observe.
 */
export function LandingMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document
        .querySelectorAll<HTMLElement>(".reveal, .reveal-stagger")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealIO.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    function mountReveals() {
      document
        .querySelectorAll<HTMLElement>(".reveal, .reveal-stagger")
        .forEach((el) => {
          if (el.dataset.revealMounted === "1") return;
          if (el.classList.contains("is-visible")) return;
          el.dataset.revealMounted = "1";
          revealIO.observe(el);
        });
    }

    function parse(raw: string) {
      const m = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)([^\d]*)$/);
      if (!m) return null;
      return {
        prefix: m[1],
        num: parseFloat(m[2]),
        suffix: m[3],
        decimals: (m[2].split(".")[1] || "").length,
      };
    }

    function animate(el: HTMLElement) {
      const initial = el.dataset.countupTarget || el.textContent?.trim() || "";
      const parsed = parse(initial);
      if (!parsed) return;
      el.dataset.countupTarget = initial;
      const duration = 1200;
      const start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function tick(now: number) {
        const p = Math.min(1, (now - start) / duration);
        const v = parsed!.num * ease(p);
        el.textContent =
          parsed!.prefix + v.toFixed(parsed!.decimals) + parsed!.suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = parsed!.prefix + parsed!.num + parsed!.suffix;
      }
      requestAnimationFrame(tick);
    }

    const countupIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animate(entry.target as HTMLElement);
            countupIO.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 }
    );

    function mountCountUp() {
      document.querySelectorAll<HTMLElement>("[data-countup]").forEach((el) => {
        if (el.dataset.countupMounted === "1") return;
        el.dataset.countupMounted = "1";
        countupIO.observe(el);
      });
    }

    let raf: number | null = null;
    function rescan() {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        mountReveals();
        mountCountUp();
      });
    }

    mountReveals();
    mountCountUp();

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "childList" &&
          (m.addedNodes.length || m.removedNodes.length)
        ) {
          rescan();
          return;
        }
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    });

    return () => {
      revealIO.disconnect();
      countupIO.disconnect();
      mo.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
