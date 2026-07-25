"use client";

import { useState } from "react";
import { CheckSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { TutorShell } from "@/components/layout/tutor-shell";
import { EmptyState } from "@/components/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskTabs } from "@/components/tasks/task-tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addTask, type TaskPriority } from "@/lib/redux/tasks-slice";
import {
  selectLastUpdatedTaskId,
  selectTasksForActiveTab,
} from "@/lib/redux/tasks-selectors";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { publishLiveEvent } from "@/lib/realtime/live-bus";
import { useDemoStore } from "@/lib/store/demo-store";

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasksForActiveTab);
  const lastUpdatedId = useAppSelector(selectLastUpdatedTaskId);
  const students = useDemoStore((s) => s.students);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  function studentName(id?: string) {
    return students.find((s) => s.id === id)?.fullName;
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    dispatch(
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        studentId: studentId || undefined,
        priority,
      }),
    );
    publishLiveEvent({
      kind: "task",
      title: "New task created",
      body: title.trim(),
      href: "/tasks",
    });
    toast.success("Task added");
    setOpen(false);
    setTitle("");
    setDescription("");
    setStudentId("");
    setPriority("medium");
  }

  return (
    <TutorShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--mentra-ink)]">
              Tasks
            </h1>
            <p className="mt-1 text-sm text-[var(--mentra-muted)]">
              Follow-ups and prep work — managed with Redux so only the changed
              task updates in state.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create task</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={onCreate}>
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-desc">Description</Label>
                  <Textarea
                    id="task-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(v) => setPriority(v as TaskPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TaskTabs />

        {!tasks.length ? (
          <EmptyState
            icon={<CheckSquare className="h-5 w-5" />}
            title="No tasks in this tab"
            description="Create a follow-up or switch tabs. Status changes update only that task in Redux — other tabs keep their cached selectors."
            actionLabel="New task"
            onAction={() => setOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                studentName={studentName(task.studentId)}
                highlight={task.id === lastUpdatedId}
              />
            ))}
          </div>
        )}
      </div>
    </TutorShell>
  );
}
