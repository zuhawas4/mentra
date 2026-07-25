"use client";

import Link from "next/link";
import {
  Bell,
  ClipboardList,
  MessageSquare,
  Radio,
  Sparkles,
  UserRound,
} from "lucide-react";
import { TutorShell } from "@/components/layout/tutor-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LiveNotificationKind } from "@/lib/redux/notifications-slice";
import {
  clearNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/redux/notifications-slice";
import { useNotificationItems } from "@/lib/redux/notification-selectors";
import { useAppDispatch } from "@/lib/redux/store";
import { formatRelative, cn } from "@/lib/utils";

const icons: Record<LiveNotificationKind, typeof Bell> = {
  session_live: Radio,
  session_ended: Sparkles,
  student_joined: UserRound,
  chat: MessageSquare,
  task: ClipboardList,
  system: Bell,
};

export default function NotificationsPage() {
  const items = useNotificationItems();
  const dispatch = useAppDispatch();

  return (
    <TutorShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-[var(--mentra-muted)]">
              Live session, student, and task updates in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(markAllNotificationsRead())}
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearNotifications())}
            >
              Clear
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {items.length ? (
              items.map((item) => {
                const Icon = icons[item.kind] ?? Bell;
                return (
                  <Link
                    key={item.id}
                    href={item.href ?? "/dashboard"}
                    onClick={() => dispatch(markNotificationRead(item.id))}
                    className={cn(
                      "flex gap-3 border-b border-[var(--mentra-border)] px-5 py-4 last:border-0 hover:bg-[var(--mentra-background)]",
                      !item.read && "bg-[var(--mentra-primary-soft)]/30",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--mentra-ink)]">
                          {item.title}
                        </span>
                        <span
                          className="text-xs text-[var(--mentra-muted)]"
                          suppressHydrationWarning
                        >
                          {formatRelative(item.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-[var(--mentra-muted)]">
                        {item.body}
                      </span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-5 py-12 text-center text-sm text-[var(--mentra-muted)]">
                No notifications yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </TutorShell>
  );
}
