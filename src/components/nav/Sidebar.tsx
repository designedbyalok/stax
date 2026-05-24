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
    <aside className="hidden md:flex w-56 flex-col border-r bg-muted/30">
      <div className="px-4 h-12 flex items-center">
        <Link
          href="/board"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <StaxMark size={18} strokeWidth={2.5} gap={2} />
          Stax
        </Link>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-foreground/[0.06] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 pb-1 px-2">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Library
          </div>
        </div>
        <Link
          href="/library/questions"
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
            pathname.startsWith("/library/questions")
              ? "bg-foreground/[0.06] text-foreground font-medium"
              : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
          Questions
        </Link>
        <Link
          href="/library/stories"
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
            pathname.startsWith("/library/stories")
              ? "bg-foreground/[0.06] text-foreground font-medium"
              : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.75} />
          STAR Stories
        </Link>
      </nav>

      <div className="px-2 py-2 border-t space-y-0.5">
        <Link
          href="/settings/account"
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
            pathname.startsWith("/settings")
              ? "bg-foreground/[0.06] text-foreground font-medium"
              : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" strokeWidth={1.75} />
          Settings
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 px-2 py-2 mt-1 w-full text-left rounded-md hover:bg-foreground/[0.04] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-[11px] font-medium text-foreground shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{user.name || "Account"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                </div>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-[calc(100%-1rem)] min-w-[200px]">
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
