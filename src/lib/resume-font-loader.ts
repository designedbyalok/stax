"use client";

import { useEffect } from "react";
import { googleFontsHref } from "./resume-fonts";

const injectedHrefs = new Set<string>();

/** Inject a Google Fonts stylesheet without a React <link> (avoids nextjs-no-css-link). */
export function injectGoogleFontStylesheet(href: string): void {
  if (!href || injectedHrefs.has(href)) return;
  injectedHrefs.add(href);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/** Load the active resume font for preview rendering. */
export function useGoogleResumeFont(family: string): void {
  useEffect(() => {
    injectGoogleFontStylesheet(googleFontsHref([family]));
  }, [family]);
}

/** Lazy-load the full font catalog through Next.js CSS (font picker previews). */
export function useResumeFontCatalog(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    void import("@/components/resume-builder/resume-font-catalog.css");
  }, [enabled]);
}
