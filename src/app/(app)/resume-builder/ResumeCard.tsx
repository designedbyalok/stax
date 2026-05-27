import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ApiResume } from "@/lib/types/resume";
import { ResumePreview } from "./ResumePreview";

interface ResumeCardProps {
  resume: ApiResume;
  onClick: () => void;
}

export function ResumeCard({ resume, onClick }: ResumeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // The base width of our preview is 816px
        const newScale = entry.contentRect.width / 816;
        setScale(newScale);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className="group flex flex-col gap-2 cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02]"
      onClick={onClick}
    >
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border bg-card shadow-sm group-hover:shadow-md transition-shadow"
      >
        {/* Type Badge - Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide shadow-sm backdrop-blur-md bg-white/80 dark:bg-black/60 text-foreground border border-black/5 dark:border-white/10">
            Generated Resume
          </span>
        </div>

        {/* Aspect Ratio Container for 8.5x11 */}
        <div className="relative w-full aspect-[8.5/11]">
          {/* Scaled Preview */}
          <div 
            className="absolute top-0 left-0"
            style={{ 
              width: "816px", 
              height: "1056px",
              transform: `scale(${scale})`,
              transformOrigin: "top left"
            }}
          >
            {/* We render the preview wrapped in a div so it doesn't take the full screen styles automatically */}
            <div className="pointer-events-none select-none">
              <ResumePreview resume={resume.content} />
            </div>
          </div>
        </div>

        {/* Glassmorphic Footer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-[2px]">
          <h3 className="font-semibold text-sm truncate text-foreground">
            {resume.content.basics.name || resume.title || "Untitled Resume"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last updated on {format(new Date(resume.updatedAt), "M/d/yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}
