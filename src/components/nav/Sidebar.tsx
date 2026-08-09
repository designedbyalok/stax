"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  DashboardSquare01Icon,
  Calendar03Icon,
  Notification03Icon,
  File01Icon,
  PenTool03Icon,
  Analytics01Icon,
  Message01Icon,
  BookOpen01Icon,
  Settings02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { StaxMark } from "@/components/StaxMark";
import { api } from "@/lib/api-client";
import { useSettingsModal } from "@/lib/settings-modal-store";
import { useProfileModal } from "@/lib/profile-modal-store";
import { ProfileAvatarRing } from "@/components/profile/ProfileAvatarRing";

type Item = {
  href: string;
  label: string;
  icon: IconSvgElement;
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
    icon: DashboardSquare01Icon,
    kbd: "⌘1",
    matches: ["/board", "/list"],
  },
  { href: "/interviews", label: "Interviews", icon: Calendar03Icon, countKey: "interviews" },
  { href: "/reminders", label: "Reminders", icon: Notification03Icon, countKey: "reminders" },
  { href: "/documents", label: "Documents", icon: File01Icon },
  { href: "/resume-builder", label: "Resume Builder", icon: PenTool03Icon },
  { href: "/insights", label: "Insights", icon: Analytics01Icon },
];

const NAV_LIBRARY: Item[] = [
  { href: "/library/questions", label: "Questions", icon: Message01Icon },
  { href: "/library/stories", label: "STAR Stories", icon: BookOpen01Icon },
];

export function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return (
    <Suspense fallback={null}>
      <SidebarContent user={user} />
    </Suspense>
  );
}

function SidebarContent({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openSettings = useSettingsModal((s) => s.openModal);
  const openProfile = useProfileModal((s) => s.openModal);

  // The resume builder goes full-screen once a resume is open, and onboarding
  // is its own focused full-screen flow. Hiding the sidebar hands those views
  // the whole viewport.
  const inResumeBuilder =
    pathname === "/resume-builder" && searchParams.get("id") !== null;
  const hideChrome = inResumeBuilder || pathname === "/onboarding";

  // Drives the avatar's completion ring + first-name label.
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile().then((r) => r.profile),
  });
  const profile = profileQuery.data;
  const displayName = profile?.name || user.name || "";
  const firstName = displayName.trim().split(/\s+/)[0] || "Account";
  const completionPct = profile?.completion.percent ?? 0;

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

  if (hideChrome) return null;

  return (
    <aside className="hidden md:flex w-[228px] shrink-0 flex-col bg-background">
      {/* Brand */}
      <div className="px-3 pt-4 pb-3">
        <Link
          href="/board"
          className="group flex items-center gap-2 px-2 font-semibold tracking-[-0.02em] text-foreground text-[15px] outline-none"
        >
          <span className="grid h-[22px] w-[22px] place-items-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/30 transition-transform group-hover:scale-105">
            <StaxMark size={13} strokeWidth={2.75} gap={2} />
          </span>
          Stax
        </Link>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto scroll-soft px-3 space-y-5">
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
          <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-[12px] leading-[1.5] text-muted-foreground">
            <div className="mb-0.5 flex items-center gap-1.5 font-semibold text-foreground">
              <Icon icon={Mail01Icon} size={13} strokeWidth={2} />
              Forward emails →
            </div>
            <span className="break-all">{inboundEmail}</span>
            <span className="mt-0.5 block">to auto-update cards.</span>
          </div>
        </div>
      )}

      {/* Settings — opens a global modal instead of navigating */}
      <div className="px-3 pb-2 pt-1">
        <button
          type="button"
          onClick={() => openSettings()}
          className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Icon
            icon={Settings02Icon}
            size={17}
            className="text-muted-foreground transition-transform duration-500 group-hover:rotate-90 group-hover:text-foreground"
          />
          Settings
        </button>
      </div>

      {/* User chip — avatar + completion ring, opens the profile modal */}
      <div className="border-t border-border px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={() => openProfile()}
          className="flex w-full items-center gap-2.5 rounded-lg border border-transparent p-2 outline-none transition-colors hover:border-border hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label={`Open your profile — ${completionPct}% complete`}
        >
          <ProfileAvatarRing
            name={displayName || user.email}
            photoUrl={profile?.photoUrl}
            percent={completionPct}
            size={32}
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[13px] font-medium leading-[1.25] text-foreground">
              {firstName}
            </div>
            {completionPct < 100 && (
              <div className="mt-0.5 truncate text-[12px] leading-[1.25] text-muted-foreground">
                Profile {completionPct}%
              </div>
            )}
          </div>
        </button>
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
      <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60">
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
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      {/* Filled glyph when active, linear otherwise — the deliberate mix,
          kept neutral so the nav reads with Linear's restraint. */}
      <Icon
        icon={item.icon}
        size={18}
        solid={active}
        strokeWidth={1.8}
        className={cn(
          "transition-colors",
          active ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
        )}
      />
      <span className="truncate">{item.label}</span>
      {count !== undefined && count > 0 ? (
        <span className="ml-auto text-[12px] font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      ) : item.kbd ? (
        <span className="ml-auto font-mono text-[11px] tracking-wider text-muted-foreground/50">
          {item.kbd}
        </span>
      ) : null}
    </Link>
  );
}
