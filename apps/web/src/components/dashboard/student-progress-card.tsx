import Link from "next/link";
import type { Student } from "@mentra/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

export function StudentProgressCard({ students }: { students: Student[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.slice(0, 3).map((student) => (
          <Link
            key={student.id}
            href={`/students/${student.id}`}
            className="block rounded-xl transition hover:opacity-90"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  {student.avatarUrl ? (
                    <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                  ) : null}
                  <AvatarFallback name={student.fullName} />
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[var(--mentra-ink)]">
                    {student.fullName.split(" ")[0]}
                  </p>
                  <p className="text-xs text-[var(--mentra-muted)]">
                    {student.subjects[0]}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-[var(--mentra-ink)]">
                {student.progress ?? 0}%
              </span>
            </div>
            <ProgressBar value={student.progress ?? 0} />
          </Link>
        ))}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/students">Manage students</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
