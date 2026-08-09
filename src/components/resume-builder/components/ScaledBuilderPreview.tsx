"use client";

import { useEffect, useRef, useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { ResumePreview } from "../ResumePreview";

// Fit-to-height preview component for the builder
export function ScaledBuilderPreview({ resume }: { resume: ResumeData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [actualHeight, setActualHeight] = useState(1123);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const { width, height } = entry.contentRect;
          const availableW = Math.max(width - 64, 0);
          const availableH = Math.max(height - 64, 0);

          const scaleW = availableW / 794;
          const scaleH = availableH / 1123;

          setScale(Math.min(scaleW, scaleH, 1.5));
        }
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Pagination Engine. Walks the rendered preview reading layout
  // (getBoundingClientRect) in a loop — a forced reflow that's costly to run
  // on every keystroke. Debounce so it runs ~150ms after edits/resize settle.
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = containerRef.current?.querySelector("#resume-preview-content") as HTMLElement;
      if (!container) return;

      const elements = container.querySelectorAll("*");
      elements.forEach((el) => {
        if ((el as HTMLElement).dataset.pageSpacer) {
          (el as HTMLElement).style.marginTop = "";
          delete (el as HTMLElement).dataset.pageSpacer;
        }
      });

      const PAGE_HEIGHT = 1123;
      const BOTTOM_MARGIN = 40;
      const TOP_MARGIN = 40;
      const GAP = 16;

      const blocks = Array.from(container.querySelectorAll("p, h1, h2, h3, h4, li, .section-block, .contact-link"));

      let containerRect = container.getBoundingClientRect();

      for (let i = 0; i < blocks.length; i++) {
        const el = blocks[i] as HTMLElement;
        const rect = el.getBoundingClientRect();

        const top = (rect.top - containerRect.top) / scale;
        const bottom = (rect.bottom - containerRect.top) / scale;

        const pageIndex = Math.floor(bottom / PAGE_HEIGHT);
        if (pageIndex === 0) continue;

        const pageBoundary = pageIndex * PAGE_HEIGHT;
        const dangerStart = pageBoundary - BOTTOM_MARGIN;

        if (bottom > dangerStart && top < pageBoundary + GAP) {
          const targetTop = pageBoundary + GAP + TOP_MARGIN;
          const pushAmount = targetTop - top;
          el.style.marginTop = `${pushAmount}px`;
          el.dataset.pageSpacer = "true";

          containerRect = container.getBoundingClientRect();
        }
      }

      setActualHeight(container.scrollHeight);
    }, 150);
    return () => clearTimeout(timer);
  }, [resume, scale]);

  const pages = Math.max(1, Math.ceil(actualHeight / 1123));

  return (
    <div ref={containerRef} className="w-full h-full flex items-start justify-center overflow-auto no-scrollbar py-8">
      <div
        style={{
          width: "794px",
          height: `${actualHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          transition: "transform 0.1s ease-out",
        }}
        className="shrink-0 relative"
      >
        <ResumePreview resume={resume} />

        {Array.from({ length: pages - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 w-full bg-[#f1f5f9] print:hidden z-50 pointer-events-none"
            style={{
              top: (i + 1) * 1123,
              height: 16,
            }}
          />
        ))}
      </div>
    </div>
  );
}
