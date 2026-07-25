"use client";

import { BookOpen, FileText } from "lucide-react";
import { TutorShell } from "@/components/layout/tutor-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate } from "@/lib/utils";

export default function ResourcesPage() {
  const resources = useDemoStore((s) => s.resources);
  const notes = useDemoStore((s) => s.notes);
  const sessions = useDemoStore((s) => s.sessions);

  return (
    <TutorShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
            Resources & notes
          </h1>
          <p className="mt-1 text-sm text-[var(--mentra-muted)]">
            Teaching materials and session notes connected to your lessons.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-[var(--mentra-ink)]">
                  {resource.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="muted">{resource.subject}</Badge>
                  <span className="text-xs text-[var(--mentra-muted)]">
                    {formatShortDate(resource.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent session notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.map((note) => {
              const session = sessions.find((s) => s.id === note.sessionId);
              return (
                <div
                  key={note.id}
                  className="rounded-xl border border-[var(--mentra-border)] p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--mentra-primary)]" />
                    <p className="text-sm font-semibold text-[var(--mentra-ink)]">
                      {session?.title ?? "Session note"}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--mentra-muted)]">{note.content}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </TutorShell>
  );
}
