"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { TutorSidebar } from "@/components/layout/tutor-sidebar";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TutorShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AuthGate role="tutor">
      <div className="min-h-screen bg-[var(--mentra-background)]">
        <TutorSidebar open={open} onClose={() => setOpen(false)} />
        <div className="lg:pl-[260px]">
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--mentra-border)] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl border border-[var(--mentra-border)] p-2 text-[var(--mentra-ink)]"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-[var(--mentra-ink)]">
              Mentra
            </span>
            <div className="w-10" />
          </div>
          <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>
        </div>
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--mentra-border)] bg-white/95 backdrop-blur lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="grid grid-cols-5">
            {mobileNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium",
                      active
                        ? "text-[var(--mentra-primary)]"
                        : "text-[var(--mentra-muted)]",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </AuthGate>
  );
}
