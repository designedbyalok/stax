"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Bell,
  FileText,
  LogOut,
  Settings,
  Calendar,
  BookOpen,
  MessageSquare,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StaxMark } from "@/components/StaxMark";
import { api } from "@/lib/api-client";
import { useSettingsModal } from "@/lib/settings-modal-store";

type Item = {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  kbd?: string;
  countKey?: "reminders" | "interviews";
  /** Additional path prefixes that should mark this item active.
   *  e.g. Pipeline owns both /board and /list views. */
  matches?: string[];
};

const NAV_WORKSPACE: Item[] = [
  {
    href: "/board",
    label: "Pipeline",
    icon: LayoutGrid,
    kbd: "⌘1",
    matches: ["/board", "/list"],
  },
  { href: "/interviews", label: "Interviews", icon: Calendar, countKey: "interviews" },
  { href: "/reminders", label: "Reminders", icon: Bell, countKey: "reminders" },
  { href: "/documents", label: "Documents", icon: FileText },
];

const NAV_LIBRARY: Item[] = [
  { href: "/library/questions", label: "Questions", icon: MessageSquare },
  { href: "/library/stories", label: "STAR Stories", icon: BookOpen },
];

export function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const openSettings = useSettingsModal((s) => s.openModal);
  const initial = (user.name || user.email || "U").trim().charAt(0).toUpperCase();

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => api.listReminders().then((r) => r.reminders),
  });
  const reminderCount =
    (remindersQuery.data ?? []).filter(
      (r) => r.status === "PENDING" || r.status === "SNOOZED"
    ).length || 0;

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const r = await fetch("/api/user");
      if (!r.ok) throw new Error(`/api/user ${r.status}`);
      return r.json() as Promise<{ inboundEmailToken?: string | null }>;
    },
  });
  const inboundEmail = userQuery.data?.inboundEmailToken
    ? `${userQuery.data.inboundEmailToken}@in.jobstax.com`
    : null;

  const counts = { reminders: reminderCount, interviews: 0 };

  return (
    <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="px-3 pt-4 pb-3">
        <Link
          href="/board"
          className="flex items-center gap-2 px-2 font-semibold tracking-[-0.01em] text-foreground text-[14px]"
        >
          <StaxMark size={16} strokeWidth={2.5} gap={2} />
          Stax
        </Link>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto scroll-soft px-3 space-y-4">
        <Section label="Workspace">
          {NAV_WORKSPACE.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              count={item.countKey ? counts[item.countKey] : undefined}
            />
          ))}
        </Section>

        <Section label="Library">
          {NAV_LIBRARY.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </Section>
      </nav>

      {/* Inbound email tip */}
      {inboundEmail && (
        <div className="px-3 pb-2">
          <div className="bg-background border border-border rounded-lg px-3 py-2.5 text-[12px] text-muted-foreground leading-[1.5]">
            <div className="flex items-center gap-1.5 text-foreground font-semibold mb-0.5">
              <Mail className="h-3 w-3" strokeWidth={2} />
              Forward emails →
            </div>
            <span className="break-all">{inboundEmail}</span>
            <span className="block mt-0.5">to auto-update cards.</span>
          </div>
        </div>
      )}

      {/* Settings — opens a global modal instead of navigating */}
      <div className="px-3 pb-2 pt-1">
        <button
          type="button"
          onClick={() => openSettings()}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[14px] font-medium text-foreground/80 hover:bg-background hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.7} />
          Settings
        </button>
      </div>

      {/* User chip — anchored at the very bottom */}
      <div className="px-3 pb-3 pt-1 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-background hover:border-border border border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/20">
                <div className="w-[26px] h-[26px] rounded-md bg-foreground text-background grid place-items-center text-[12px] font-semibold tracking-[-0.01em] shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[13px] font-medium text-foreground truncate leading-[1.25]">
                    {user.name || "Account"}
                  </div>
                  <div className="text-[12px] text-muted-foreground truncate leading-[1.25] mt-0.5">
                    {user.email}
                  </div>
                </div>
                <CaretSvg />
              </button>
            }
          />
          <DropdownMenuContent
            align="start"
            side="top"
            className="w-[208px]"
          >
            <DropdownMenuItem onClick={() => openSettings()}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
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

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-2.5 pt-1.5 pb-1 text-[12px] font-medium text-muted-foreground/70">
        {label}
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  count,
}: {
  item: Item;
  pathname: string;
  count?: number;
}) {
  const patterns = item.matches ?? [item.href];
  const active = patterns.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group/nav relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[14px] font-medium transition-colors",
        active
          ? "bg-background text-foreground"
          : "text-foreground/80 hover:bg-background hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
        )}
        strokeWidth={1.7}
      />
      <span className="truncate">{item.label}</span>
      {count !== undefined && count > 0 ? (
        <span className="ml-auto text-[12px] text-muted-foreground/80 tabular-nums">
          {count}
        </span>
      ) : item.kbd ? (
        <span className="ml-auto text-[12px] text-muted-foreground/60 font-medium tracking-wider">
          {item.kbd}
        </span>
      ) : null}
    </Link>
  );
}

function CaretSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0"
      aria-hidden
    >
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </svg>
  );
}
