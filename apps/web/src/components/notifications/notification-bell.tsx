"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CheckCheck,
  MessageSquare,
  Radio,
  Sparkles,
  UserRound,
  ClipboardList,
} from "lucide-react";
import type { LiveNotificationKind } from "@/lib/redux/notifications-slice";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/redux/notifications-slice";
import {
  selectUnreadCount,
  useNotificationItems,
} from "@/lib/redux/notification-selectors";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { formatRelative, cn } from "@/lib/utils";

type PanelCoords = { top: number; right: number };

const kindIcon: Record<
  LiveNotificationKind,
  { icon: typeof Bell; className: string; bg: string }
> = {
  session_live: {
    icon: Radio,
    className: "text-[var(--mentra-success)]",
    bg: "bg-[var(--mentra-success-soft)]",
  },
  session_ended: {
    icon: Sparkles,
    className: "text-[var(--mentra-primary)]",
    bg: "bg-[var(--mentra-primary-soft)]",
  },
  student_joined: {
    icon: UserRound,
    className: "text-[var(--mentra-primary)]",
    bg: "bg-[var(--mentra-primary-soft)]",
  },
  chat: {
    icon: MessageSquare,
    className: "text-[var(--mentra-amber)]",
    bg: "bg-[var(--mentra-amber-soft)]",
  },
  task: {
    icon: ClipboardList,
    className: "text-[var(--mentra-primary)]",
    bg: "bg-[var(--mentra-primary-soft)]",
  },
  system: {
    icon: Bell,
    className: "text-[var(--mentra-muted)]",
    bg: "bg-[#F1F1F6]",
  },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();
  const items = useNotificationItems();
  const unread = useAppSelector(selectUnreadCount);
  const connected = useAppSelector((s) => s.notifications.connected);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const panel =
    open && mounted && coords
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[200] cursor-default bg-transparent"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-label="Notifications"
              className="fixed z-[210] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-[var(--mentra-border)] bg-white shadow-[0_16px_48px_rgba(32,32,42,0.14)] animate-fade-up"
              style={{ top: coords.top, right: coords.right }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[var(--mentra-border)] px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-[var(--mentra-ink)]">
                    Notifications
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--mentra-muted)]">
                    {connected ? "Live updates on" : "Demo live bus"}
                    {unread > 0 ? ` · ${unread} unread` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--mentra-primary)] hover:underline disabled:opacity-40"
                  disabled={!unread}
                  onClick={() => dispatch(markAllNotificationsRead())}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              </div>

              <ul className="max-h-[22rem] overflow-auto py-1">
                {items.length ? (
                  items.slice(0, 8).map((item) => {
                    const meta = kindIcon[item.kind] ?? kindIcon.system;
                    const Icon = meta.icon;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href ?? "/dashboard"}
                          onClick={() => {
                            dispatch(markNotificationRead(item.id));
                            setOpen(false);
                          }}
                          className={cn(
                            "flex gap-3 px-4 py-3 transition hover:bg-[var(--mentra-background)]",
                            !item.read && "bg-[var(--mentra-primary-soft)]/35",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              meta.bg,
                            )}
                          >
                            <Icon className={cn("h-4 w-4", meta.className)} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-[var(--mentra-ink)]">
                                {item.title}
                              </span>
                              {!item.read ? (
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mentra-primary)]" />
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--mentra-muted)]">
                              {item.body}
                            </span>
                            <span
                              className="mt-1 block text-[11px] text-[var(--mentra-muted)]"
                              suppressHydrationWarning
                            >
                              {formatRelative(item.createdAt)} ago
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="flex flex-col items-center px-6 py-10 text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]">
                      <BellOff className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold text-[var(--mentra-ink)]">
                      You&apos;re all caught up
                    </p>
                    <p className="mt-1 text-xs text-[var(--mentra-muted)]">
                      Live session events and student activity will show up here.
                    </p>
                  </li>
                )}
              </ul>

              <div className="border-t border-[var(--mentra-border)] bg-[#FAFAFC] px-3 py-2.5">
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-[var(--mentra-primary)] transition hover:bg-white"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--mentra-border)] bg-white text-[var(--mentra-ink)] shadow-sm transition hover:bg-[var(--mentra-background)]",
          open && "ring-2 ring-[var(--mentra-primary)]/20",
        )}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#E5484D] ring-2 ring-white" />
        ) : null}
      </button>
      {panel}
    </div>
  );
}
