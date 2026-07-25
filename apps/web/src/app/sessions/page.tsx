"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, List, Search } from "lucide-react";
import { TutorShell } from "@/components/layout/tutor-shell";
import { NewSessionDialog } from "@/components/sessions/new-session-dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionActions } from "@/lib/hooks/use-session-actions";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, formatTime, cn } from "@/lib/utils";
import type { SessionStatus } from "@mentra/shared";

const statuses: Array<SessionStatus | "all"> = [
  "all",
  "scheduled",
  "live",
  "completed",
  "cancelled",
];

export default function SessionsPage() {
  const sessions = useDemoStore((s) => s.sessions);
  const students = useDemoStore((s) => s.students);
  const { updateStatus } = useSessionActions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SessionStatus | "all">("all");
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    return sessions
      .filter((session) => {
        const student = students.find((s) => s.id === session.studentId);
        const q = query.toLowerCase();
        const matchesQuery =
          !q ||
          session.title.toLowerCase().includes(q) ||
          session.topic?.toLowerCase().includes(q) ||
          student?.fullName.toLowerCase().includes(q);
        const matchesStatus = status === "all" || session.status === status;
        const matchesDate =
          !date || session.scheduledAt.slice(0, 10) === date;
        return matchesQuery && matchesStatus && matchesDate;
      })
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );
  }, [sessions, students, query, status, date]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const session of filtered) {
      const key = session.scheduledAt.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), session]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  function studentName(id?: string) {
    return students.find((s) => s.id === id)?.fullName ?? "Student";
  }

  return (
    <TutorShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--mentra-ink)]">
              Sessions
            </h1>
            <p className="mt-1 text-sm text-[var(--mentra-muted)]">
              Schedule, start, and review tutoring sessions.
            </p>
          </div>
          <NewSessionDialog />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mentra-muted)]" />
            <Input
              className="pl-9"
              placeholder="Search by student or topic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="lg:w-44"
            aria-label="Filter by date"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                status === s
                  ? "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]"
                  : "border border-[var(--mentra-border)] bg-white text-[var(--mentra-muted)]",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-3.5 w-3.5" /> List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {!filtered.length ? (
              <EmptyState
                icon={<CalendarDays className="h-5 w-5" />}
                title="No sessions found"
                description="Create a session or adjust your filters."
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[var(--mentra-ink)]">
                            {session.title}
                          </h3>
                          <StatusBadge status={session.status} />
                        </div>
                        <p className="mt-1 text-sm text-[var(--mentra-muted)]">
                          {studentName(session.studentId)} ·{" "}
                          {formatShortDate(session.scheduledAt)} ·{" "}
                          {formatTime(session.scheduledAt)} ·{" "}
                          {session.durationMinutes ?? 60} min
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {session.status === "scheduled" ? (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(session.id, "live")}
                            asChild
                          >
                            <Link href={`/room/${session.id}`}>Start</Link>
                          </Button>
                        ) : null}
                        {session.status === "live" ? (
                          <Button size="sm" asChild>
                            <Link href={`/room/${session.id}`}>Join</Link>
                          </Button>
                        ) : null}
                        {session.status === "completed" ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/sessions/${session.id}`}>View summary</Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/sessions/${session.id}`}>Details</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-4">
              {byDay.map(([day, items]) => (
                <Card key={day}>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-[var(--mentra-ink)]">
                      {formatShortDate(`${day}T12:00:00`)}
                    </h3>
                    <div className="space-y-2">
                      {items
                        .sort(
                          (a, b) =>
                            new Date(a.scheduledAt).getTime() -
                            new Date(b.scheduledAt).getTime(),
                        )
                        .map((session) => (
                          <Link
                            key={session.id}
                            href={
                              session.status === "completed"
                                ? `/sessions/${session.id}`
                                : `/room/${session.id}`
                            }
                            className="flex items-center justify-between rounded-xl bg-[var(--mentra-background)] px-3 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {formatTime(session.scheduledAt)} · {session.topic}
                              </p>
                              <p className="text-xs text-[var(--mentra-muted)]">
                                {studentName(session.studentId)}
                              </p>
                            </div>
                            <StatusBadge status={session.status} />
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TutorShell>
  );
}
