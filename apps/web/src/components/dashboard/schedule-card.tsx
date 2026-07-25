import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Student, StudySession } from "@mentra/shared";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, cn } from "@/lib/utils";

export function ScheduleCard({
  sessions,
  students,
  dateLabel,
  onStart,
}: {
  sessions: StudySession[];
  students: Student[];
  dateLabel: string;
  onStart: (sessionId: string) => void;
}) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Your schedule</CardTitle>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--mentra-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--mentra-ink)] shadow-sm"
        >
          <CalendarDays className="h-3.5 w-3.5 text-[var(--mentra-muted)]" />
          {dateLabel}
        </button>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {sessions.length ? (
          sessions.map((session) => {
            const student = students.find((s) => s.id === session.studentId);
            const inProgress = session.status === "live";
            return (
              <div
                key={session.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                  inProgress
                    ? "bg-[var(--mentra-primary-soft)]"
                    : "border border-[var(--mentra-border)] bg-white",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-12 shrink-0 text-sm font-semibold tabular-nums text-[var(--mentra-muted)]">
                    {formatTime(session.scheduledAt)}
                  </div>
                  <Avatar className="h-9 w-9">
                    {student?.avatarUrl ? (
                      <AvatarImage
                        src={student.avatarUrl}
                        alt={student.fullName}
                      />
                    ) : null}
                    <AvatarFallback name={student?.fullName ?? "ST"} />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--mentra-ink)]">
                      {session.topic ?? session.title}
                    </p>
                    <p className="truncate text-xs text-[var(--mentra-muted)]">
                      {student?.fullName ?? "Student"} ·{" "}
                      {session.durationMinutes ?? 60} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <StatusBadge
                    status={session.status}
                    label={session.status === "live" ? "In progress" : undefined}
                  />
                  {inProgress ? (
                    <Button asChild size="sm">
                      <Link href={`/room/${session.id}`}>Join</Link>
                    </Button>
                  ) : session.status === "scheduled" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStart(session.id)}
                      asChild
                    >
                      <Link href={`/room/${session.id}`}>Start</Link>
                    </Button>
                  ) : session.status === "completed" ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/sessions/${session.id}`}>Summary</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-[var(--mentra-muted)]">
            Nothing on the schedule for this day.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
