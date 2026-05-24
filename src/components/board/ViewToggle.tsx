"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

// Inline segmented control to switch between the board and list
// views of the pipeline. Both routes are kept; this just gives
// users one persistent affordance to flip between them.
export function ViewToggle() {
  const pathname = usePathname();
  const isBoard = pathname.startsWith("/board");
  const isList = pathname.startsWith("/list");

  return (
    <div
      className="inline-flex items-center p-0.5 rounded-md bg-card border border-border"
      role="tablist"
      aria-label="Pipeline view"
    >
      <Segment href="/board" active={isBoard} icon={LayoutGrid} label="Board" />
      <Segment href="/list" active={isList} icon={List} label="List" />
    </div>
  );
}

function Segment({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`${label} view`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center w-7 h-6 rounded-[5px] transition-colors",
        active
          ? "bg-background text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </Link>
  );
}
