"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { TutorShell } from "@/components/layout/tutor-shell";
import { NewSessionDialog } from "@/components/sessions/new-session-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, formatTime } from "@/lib/utils";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const student = useDemoStore((s) => s.students.find((st) => st.id === id));
  const sessions = useDemoStore((s) =>
    s.sessions
      .filter((sess) => sess.studentId === id)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      ),
  );
  const updateStudent = useDemoStore((s) => s.updateStudent);
  const [notes, setNotes] = useState(student?.notes ?? "");

  if (!student) {
    return (
      <TutorShell>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-[var(--mentra-muted)]">Student not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/students">Back to students</Link>
            </Button>
          </CardContent>
        </Card>
      </TutorShell>
    );
  }

  const upcoming = sessions.filter(
    (s) => s.status === "scheduled" || s.status === "live",
  );
  const past = sessions.filter((s) => s.status === "completed");
  const shareSession = upcoming[0] ?? sessions[0];

  return (
    <TutorShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-sm text-[var(--mentra-muted)] hover:text-[var(--mentra-ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to students
        </Link>

        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 text-lg">
                <AvatarFallback name={student.fullName} />
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
                    {student.fullName}
                  </h1>
                  <Badge>{student.status ?? "active"}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--mentra-muted)]">
                  <Mail className="h-3.5 w-3.5" />
                  {student.email ?? "No email"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {student.subjects.map((subject) => (
                    <Badge key={subject} variant="muted">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <NewSessionDialog defaultStudentId={student.id} />
              <Button
                variant="outline"
                onClick={() => {
                  if (!shareSession?.guestJoinCode) {
                    toast.error("No shareable session code available.");
                    return;
                  }
                  const url = `${window.location.origin}/join/${shareSession.guestJoinCode}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Session link copied");
                }}
              >
                <Copy className="h-4 w-4" /> Share session link
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length ? (
                upcoming.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--mentra-border)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[var(--mentra-ink)]">
                        {session.title}
                      </p>
                      <p className="text-sm text-[var(--mentra-muted)]">
                        {formatShortDate(session.scheduledAt)} ·{" "}
                        {formatTime(session.scheduledAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={session.status} />
                      <Button asChild size="sm">
                        <Link href={`/room/${session.id}`}>
                          {session.status === "live" ? "Join" : "Open"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--mentra-muted)]">
                  No upcoming sessions.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[var(--mentra-ink)]">
                {student.progress ?? 0}%
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEEFF5]">
                <div
                  className="h-full rounded-full bg-[var(--mentra-primary)]"
                  style={{ width: `${student.progress ?? 0}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {student.subjects.map((t) => (
                  <Badge key={t} variant="default">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tutor notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
              <Button
                onClick={() => {
                  updateStudent(student.id, { notes });
                  toast.success("Notes saved");
                }}
              >
                Save notes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past sessions & snapshots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {past.length ? (
                past.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block rounded-xl border border-[var(--mentra-border)] p-4 transition hover:border-[var(--mentra-primary)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--mentra-ink)]">
                          {session.title}
                        </p>
                        <p className="text-xs text-[var(--mentra-muted)]">
                          {formatShortDate(session.scheduledAt)}
                        </p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                    {session.boardSnapshotUrl ? (
                      <div className="mt-3 rounded-lg bg-[var(--mentra-background)] p-3 text-xs text-[var(--mentra-muted)]">
                        Board snapshot available
                      </div>
                    ) : null}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[var(--mentra-muted)]">
                  No completed sessions yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TutorShell>
  );
}
