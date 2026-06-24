"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Palette, Columns3, Bell, Puzzle, Trash2, X } from "@/components/icons";

const SECTIONS = [
  { href: "/settings/account", label: "Account", icon: User },
  { href: "/settings/appearance", label: "Appearance", icon: Palette },
  { href: "/settings/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/integrations", label: "Integrations", icon: Puzzle },
  { href: "/settings/trash", label: "Trash", icon: Trash2 },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 h-full overflow-hidden relative">
      {/* Dim backdrop to make it feel like a modal even though it's a page */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm pointer-events-none" />
      
      <div className="w-full max-w-5xl h-[85vh] bg-background border shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Left Nav */}
        <div className="w-full md:w-[260px] border-r bg-muted/10 shrink-0 flex flex-col">
          <div className="p-6 pb-4 shrink-0">
            <h2 className="text-base font-bold text-foreground">Settings</h2>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
            {SECTIONS.map((s) => {
              const active = pathname === s.href;
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-foreground/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.75} />
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-card">
          <button 
            onClick={() => router.push("/board")}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground z-20"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-2xl">
              {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
