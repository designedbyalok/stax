"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/pipeline", label: "Pipeline" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/trash", label: "Trash" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 grid grid-cols-[160px_1fr] gap-8">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => {
              const active = pathname === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "block px-2.5 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-foreground/[0.06] text-foreground font-medium"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
