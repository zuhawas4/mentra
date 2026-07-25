"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Settings,
  Users,
  X,
} from "lucide-react";
import { MentraLogo } from "@mentra/brand";
import { useDemoStore } from "@/lib/store/demo-store";
import { selectOpenTaskCount } from "@/lib/redux/tasks-selectors";
import { useAppSelector } from "@/lib/redux/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

export function TutorSidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useDemoStore((s) => s.user);
  const logout = useDemoStore((s) => s.logout);
  const openTasks = useAppSelector(selectOpenTaskCount);

  const content = (
    <aside className="flex h-full w-[260px] flex-col border-r border-[var(--mentra-border)] bg-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/dashboard" onClick={onClose} aria-label="Mentra home">
          <MentraLogo size={30} />
        </Link>
        {onClose ? (
          <button
            type="button"
            className="rounded-lg p-1.5 text-[var(--mentra-muted)] hover:bg-[var(--mentra-background)] lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="px-4">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--mentra-muted)]">
          Workspace
        </p>
        <nav className="space-y-1" aria-label="Tutor navigation">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]"
                    : "text-[var(--mentra-muted)] hover:bg-[var(--mentra-background)] hover:text-[var(--mentra-ink)]",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/tasks" && openTasks > 0 ? (
                  <span className="rounded-full bg-[var(--mentra-primary)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {openTasks}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-4 p-4">
        <div className="rounded-2xl bg-[#2A2548] p-4 text-white">
          <p className="text-sm font-semibold">Get more from Mentra</p>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Unlock unlimited sessions and student workspaces.
          </p>
          <Button
            size="sm"
            className="mt-3 w-full bg-white text-[var(--mentra-primary)] hover:bg-[var(--mentra-primary-soft)]"
            onClick={() => {
              onClose?.();
              router.push("/settings");
            }}
          >
            View plans
          </Button>
        </div>

        <div className="rounded-2xl border border-[var(--mentra-border)] p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback name={user?.fullName ?? "AR"} />
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--mentra-ink)]">
                {user?.fullName ?? "Amelia Rose"}
              </p>
              <p className="truncate text-xs text-[var(--mentra-muted)]">
                {user?.primarySubject
                  ? `${user.primarySubject} tutor`
                  : "Mathematics tutor"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/settings"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--mentra-muted)] hover:bg-[var(--mentra-background)]"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[var(--mentra-muted)] hover:bg-[var(--mentra-background)]"
                aria-label="More profile actions"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--mentra-muted)] hover:bg-[var(--mentra-background)] hover:text-[var(--mentra-ink)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[260px]">
        {content}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(32,32,42,0.35)]"
            aria-label="Close sidebar overlay"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">{content}</div>
        </div>
      ) : null}
    </>
  );
}
