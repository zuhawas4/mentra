import Link from "next/link";
import type { Student, StudySession } from "@mentra/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, cn } from "@/lib/utils";

export function TodaySessionsCard({
  sessions,
  students,
}: {
  sessions: StudySession[];
  students: Student[];
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>{"Today's sessions"}</CardTitle>
        <Link
          href="/sessions"
          className="text-xs font-medium text-[var(--mentra-primary)] hover:underline"
        >
          View calendar
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.length ? (
          sessions.slice(0, 4).map((session) => {
            const student = students.find((s) => s.id === session.studentId);
            const live = session.status === "live";
            return (
              <Link
                key={session.id}
                href={
                  session.status === "completed"
                    ? `/sessions/${session.id}`
                    : `/room/${session.id}`
                }
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[var(--mentra-background)]"
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-[var(--mentra-ink)]">
                  {formatTime(session.scheduledAt)}
                </span>
                <Avatar className="h-9 w-9">
                  {student?.avatarUrl ? (
                    <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                  ) : null}
                  <AvatarFallback name={student?.fullName ?? "ST"} />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--mentra-ink)]">
                    {student?.fullName ?? "Student"}
                  </p>
                  <p className="truncate text-xs text-[var(--mentra-muted)]">
                    {session.topic ?? session.title}
                  </p>
                </div>
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    live
                      ? "bg-[var(--mentra-success)] shadow-[0_0_0_3px_var(--mentra-success-soft)]"
                      : "bg-[#D0D0DC]",
                  )}
                  aria-label={live ? "Live" : "Scheduled"}
                />
              </Link>
            );
          })
        ) : (
          <p className="px-2 py-6 text-sm text-[var(--mentra-muted)]">
            No sessions scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
