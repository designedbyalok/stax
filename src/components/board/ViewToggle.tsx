"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
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
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
      role="tablist"
      aria-label="Pipeline view"
    >
      <Segment href="/board" active={isBoard} icon={GridViewIcon} label="Board" />
      <Segment href="/list" active={isList} icon={ListViewIcon} label="List" />
    </div>
  );
}

function Segment({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: IconSvgElement;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`${label} view`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-6 w-7 items-center justify-center rounded-[6px] transition-colors",
        active
          ? "bg-secondary text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon icon={icon} size={15} strokeWidth={1.9} solid={active} />
    </Link>
  );
}
