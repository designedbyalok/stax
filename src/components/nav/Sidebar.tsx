"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  List,
  Bell,
  FileText,
  LogOut,
  Settings,
  Calendar,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StaxMark } from "@/components/StaxMark";

type Item = { href: string; label: string; icon: typeof LayoutGrid };

const navItems: Item[] = [
  { href: "/board", label: "Pipeline", icon: LayoutGrid },
  { href: "/interviews", label: "Interviews", icon: Calendar },
  { href: "/list", label: "List", icon: List },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/documents", label: "Documents", icon: FileText },
];

export function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const initial = (user.name || user.email || "U").trim().charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex w-[260px] flex-col border-r bg-background shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
      <div className="px-5 h-[72px] flex items-center shrink-0">
        <Link
          href="/board"
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground text-lg"
        >
          <StaxMark size={24} strokeWidth={2.5} gap={2} />
          Stax
        </Link>
      </div>

      <div className="px-4 mb-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center justify-between w-full p-2 rounded-xl border bg-card hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-semibold text-foreground truncate">{user.name || "My Workspace"}</div>
                    <div className="text-[11px] font-medium text-muted-foreground truncate">{user.email || "Personal Account"}</div>
                  </div>
                </div>
                <div className="text-muted-foreground ml-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-[228px]">
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-1">
          <div className="px-2 pb-2 pt-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Library
          </div>
          <Link
            href="/library/questions"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname.startsWith("/library/questions")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <MessageSquare className="h-[18px] w-[18px]" strokeWidth={pathname.startsWith("/library/questions") ? 2 : 1.75} />
            Questions
          </Link>
          <Link
            href="/library/stories"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname.startsWith("/library/stories")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <BookOpen className="h-[18px] w-[18px]" strokeWidth={pathname.startsWith("/library/stories") ? 2 : 1.75} />
            STAR Stories
          </Link>
        </div>
        
        <div className="mt-8 space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </div>
          <Link
            href="/settings/account"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={pathname.startsWith("/settings") ? 2 : 1.75} />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
