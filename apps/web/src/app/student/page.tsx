"use client";

import Link from "next/link";
import { MentraLogo } from "@mentra/brand";
import { AuthGate } from "@/components/auth-gate";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, formatTime } from "@/lib/utils";

export default function StudentHomePage() {
  const user = useDemoStore((s) => s.user);
  const logout = useDemoStore((s) => s.logout);
  const sessions = useDemoStore((s) => s.sessions);
  const students = useDemoStore((s) => s.students);

  const myStudent = students.find(
    (s) => s.userId === user?.id || s.email === user?.email,
  );
  const mine = sessions
    .filter((s) =>
      myStudent ? s.studentId === myStudent.id : s.status !== "cancelled",
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  const upcoming = mine.filter(
    (s) => s.status === "scheduled" || s.status === "live",
  );
  const previous = mine.filter((s) => s.status === "completed");

  return (
    <AuthGate role="student">
      <div className="min-h-screen bg-[var(--mentra-background)]">
        <header className="border-b border-[var(--mentra-border)] bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <MentraLogo />
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-[var(--mentra-muted)] sm:inline">
                {user?.fullName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
              My sessions
            </h1>
            <p className="mt-1 text-sm text-[var(--mentra-muted)]">
              Join live lessons and revisit notes from completed sessions with your tutor.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-[var(--mentra-ink)]">Amelia Rose</p>
              <p className="text-sm text-[var(--mentra-muted)]">
                Mathematics tutor · Mentra workspace
              </p>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--mentra-ink)]">
              Upcoming
            </h2>
            {upcoming.length ? (
              upcoming.map((session) => (
                <Card key={session.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{session.title}</p>
                        <StatusBadge status={session.status} />
                      </div>
                      <p className="mt-1 text-sm text-[var(--mentra-muted)]">
                        {formatShortDate(session.scheduledAt)} ·{" "}
                        {formatTime(session.scheduledAt)}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/room/${session.id}`}>
                        {session.status === "live" ? "Join now" : "Open room"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-[var(--mentra-muted)]">
                No upcoming sessions.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--mentra-ink)]">
              Previous
            </h2>
            {previous.length ? (
              previous.map((session) => (
                <Card key={session.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="mt-1 text-sm text-[var(--mentra-muted)]">
                        {formatShortDate(session.scheduledAt)} · Notes & snapshot
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/sessions/${session.id}`}>View summary</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-[var(--mentra-muted)]">
                No previous sessions yet.
              </p>
            )}
          </section>
        </main>
      </div>
    </AuthGate>
  );
}
