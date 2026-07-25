"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { TutorShell } from "@/components/layout/tutor-shell";
import { AuthGate } from "@/components/auth-gate";
import { StatusBadge } from "@/components/status-badge";
import { WhiteboardCanvas } from "@/components/whiteboard/whiteboard-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, formatTime } from "@/lib/utils";
import type { BoardStroke } from "@mentra/shared";

const EMPTY_STROKES: BoardStroke[] = [];

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useDemoStore((s) => s.user);
  const session = useDemoStore((s) => s.sessions.find((x) => x.id === id));
  const student = useDemoStore((s) =>
    s.students.find((st) => st.id === session?.studentId),
  );
  const note = useDemoStore((s) => s.notes.find((n) => n.sessionId === id));
  const strokes = useDemoStore((s) => s.boards[id]) ?? EMPTY_STROKES;

  if (!session) {
    return (
      <AuthGate>
        <div className="p-8 text-center text-[var(--mentra-muted)]">
          Session not found.
        </div>
      </AuthGate>
    );
  }

  const content = (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={
          user?.role === "tutor"
            ? student
              ? `/students/${student.id}`
              : "/sessions"
            : "/student"
        }
        className="inline-flex items-center gap-2 text-sm text-[var(--mentra-muted)] hover:text-[var(--mentra-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {user?.role === "tutor" ? "Return to student history" : "Back to my sessions"}
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
                {session.title}
              </h1>
              <StatusBadge status={session.status} />
            </div>
            <p className="mt-2 text-sm text-[var(--mentra-muted)]">
              Tutor · Amelia Rose
              {student ? ` · Student · ${student.fullName}` : ""}
            </p>
            <p className="mt-1 text-sm text-[var(--mentra-muted)]">
              {formatShortDate(session.scheduledAt)} · {formatTime(session.scheduledAt)} ·{" "}
              {session.durationMinutes ?? 60} min
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.status !== "completed" ? (
              <Button asChild>
                <Link href={`/room/${session.id}`}>
                  {session.status === "live" ? "Join whiteboard" : "Open room"}
                </Link>
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => {
                toast.success("Snapshot export started (demo)");
              }}
            >
              <Download className="h-4 w-4" /> Download snapshot
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Board snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[360px]">
            <WhiteboardCanvas
              strokes={strokes}
              onChange={() => {}}
              authorId="readonly"
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--mentra-ink)]">
            {note?.content || session.agenda || "No notes recorded for this session."}
          </p>
        </CardContent>
      </Card>

      {student && user?.role === "tutor" ? (
        <Button asChild variant="secondary">
          <Link href={`/students/${student.id}`}>Open student profile</Link>
        </Button>
      ) : null}
    </div>
  );

  if (user?.role === "tutor") {
    return <TutorShell>{content}</TutorShell>;
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-[var(--mentra-background)] px-4 py-8">
        {content}
      </div>
    </AuthGate>
  );
}
