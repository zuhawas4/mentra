"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { TutorShell } from "@/components/layout/tutor-shell";
import { EmptyState } from "@/components/empty-state";
import { NewSessionDialog } from "@/components/sessions/new-session-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, cn } from "@/lib/utils";
import type { Student } from "@mentra/shared";

export default function StudentsPage() {
  const students = useDemoStore((s) => s.students);
  const sessions = useDemoStore((s) => s.sessions);
  const addStudent = useDemoStore((s) => s.addStudent);
  const updateStudent = useDemoStore((s) => s.updateStudent);
  const deleteStudent = useDemoStore((s) => s.deleteStudent);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subjects: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.subjects.some((sub) => sub.toLowerCase().includes(q)) ||
        s.email?.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" || (s.status ?? "active") === filter;
      return matchesQuery && matchesFilter;
    });
  }, [students, query, filter]);

  function openCreate() {
    setEditing(null);
    setForm({ fullName: "", email: "", subjects: "", notes: "" });
    setEditorOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setForm({
      fullName: student.fullName,
      email: student.email ?? "",
      subjects: student.subjects.join(", "),
      notes: student.notes ?? "",
    });
    setEditorOpen(true);
  }

  function saveStudent(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim() || undefined,
      subjects: form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: form.notes.trim() || undefined,
    };
    if (!payload.fullName) {
      toast.error("Name is required.");
      return;
    }
    if (editing) {
      updateStudent(editing.id, payload);
      toast.success("Student updated");
    } else {
      addStudent(payload);
      toast.success("Student added");
    }
    setEditorOpen(false);
  }

  function sessionInfo(studentId: string) {
    const related = sessions
      .filter((s) => s.studentId === studentId)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );
    const upcoming = related.find(
      (s) =>
        (s.status === "scheduled" || s.status === "live") &&
        new Date(s.scheduledAt).getTime() >= Date.now() - 60 * 60 * 1000,
    );
    const recent = related.find((s) => s.status === "completed");
    return { upcoming, recent };
  }

  return (
    <TutorShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--mentra-ink)]">
              Students
            </h1>
            <p className="mt-1 text-sm text-[var(--mentra-muted)]">
              Manage tutoring relationships, progress, and upcoming lessons.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add student
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mentra-muted)]" />
            <Input
              className="pl-9"
              placeholder="Search by name, subject, or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search students"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "paused"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                  filter === f
                    ? "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]"
                    : "bg-white text-[var(--mentra-muted)] border border-[var(--mentra-border)]",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {!filtered.length ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title={students.length ? "No matching students" : "No students yet"}
            description={
              students.length
                ? "Try another search or filter."
                : "Add your first student to start scheduling sessions and tracking progress."
            }
            actionLabel={students.length ? undefined : "Add student"}
            onAction={students.length ? undefined : openCreate}
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-[var(--mentra-border)] bg-white md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--mentra-border)] bg-[#FAFAFC] text-xs uppercase tracking-wide text-[var(--mentra-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Recent</th>
                    <th className="px-4 py-3 font-medium">Upcoming</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const { upcoming, recent } = sessionInfo(student.id);
                    return (
                      <tr
                        key={student.id}
                        className="border-b border-[var(--mentra-border)] last:border-0"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/students/${student.id}`}
                            className="flex items-center gap-3 hover:opacity-90"
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarFallback name={student.fullName} />
                            </Avatar>
                            <div>
                              <p className="font-medium text-[var(--mentra-ink)]">
                                {student.fullName}
                              </p>
                              <p className="text-xs text-[var(--mentra-muted)]">
                                {student.email}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[var(--mentra-muted)]">
                          {student.subjects[0] ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--mentra-muted)]">
                          {recent
                            ? formatShortDate(recent.scheduledAt)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--mentra-muted)]">
                          {upcoming
                            ? formatShortDate(upcoming.scheduledAt)
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#EEEFF5]">
                              <div
                                className="h-full bg-[var(--mentra-primary)]"
                                style={{ width: `${student.progress ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {student.progress ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <NewSessionDialog
                              defaultStudentId={student.id}
                              trigger={
                                <Button size="sm" variant="outline">
                                  Session
                                </Button>
                              }
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Edit student"
                              onClick={() => openEdit(student)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[var(--mentra-danger)]"
                              onClick={() => setDeleteId(student.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {filtered.map((student) => {
                const { upcoming } = sessionInfo(student.id);
                return (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/students/${student.id}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar>
                            <AvatarFallback name={student.fullName} />
                          </Avatar>
                          <div>
                            <p className="font-semibold text-[var(--mentra-ink)]">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-[var(--mentra-muted)]">
                              {student.subjects.join(" · ")}
                            </p>
                          </div>
                        </Link>
                        <Badge variant="default">{student.progress ?? 0}%</Badge>
                      </div>
                      <p className="mt-3 text-xs text-[var(--mentra-muted)]">
                        Upcoming:{" "}
                        {upcoming
                          ? formatShortDate(upcoming.scheduledAt)
                          : "None scheduled"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(student)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[var(--mentra-danger)]"
                          onClick={() => setDeleteId(student.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveStudent}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects (comma separated)</Label>
              <Input
                id="subjects"
                value={form.subjects}
                onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                placeholder="Calculus, A-Level Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add student"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the student and their sessions from demo data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--mentra-danger)] hover:bg-[#a83232]"
              onClick={() => {
                if (deleteId) {
                  deleteStudent(deleteId);
                  toast.success("Student deleted");
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TutorShell>
  );
}
