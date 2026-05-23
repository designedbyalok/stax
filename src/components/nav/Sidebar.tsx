"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  List,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: typeof LayoutGrid };

const navItems: Item[] = [
  { href: "/board", label: "Board", icon: LayoutGrid },
  { href: "/list", label: "List", icon: List },
  { href: "/reminders", label: "Reminders", icon: Bell },
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
          <div className="w-5 h-5 rounded-sm bg-foreground flex items-center justify-center">
            <span className="text-[10px] font-bold text-background">S</span>
          </div>
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

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Log out
        </button>

        <div className="flex items-center gap-2 px-2 py-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-[11px] font-medium text-foreground shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">{user.name || "Account"}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
