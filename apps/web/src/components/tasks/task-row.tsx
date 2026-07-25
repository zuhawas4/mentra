"use client";

import { memo } from "react";
import { Check, Circle, Loader2, Trash2 } from "lucide-react";
import type { TutorTask } from "@/lib/redux/tasks-slice";
import { setTaskStatus, removeTask } from "@/lib/redux/tasks-slice";
import { useAppDispatch } from "@/lib/redux/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Memoized row — only re-renders when its own task prop changes */
export const TaskRow = memo(function TaskRow({
  task,
  studentName,
  highlight,
}: {
  task: TutorTask;
  studentName?: string;
  highlight?: boolean;
}) {
  const dispatch = useAppDispatch();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-[var(--mentra-border)] bg-white p-4 transition sm:flex-row sm:items-center sm:justify-between",
        highlight && "ring-2 ring-[var(--mentra-primary)]",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--mentra-ink)]">{task.title}</p>
          <Badge
            variant={
              task.priority === "high"
                ? "danger"
                : task.priority === "medium"
                  ? "amber"
                  : "muted"
            }
          >
            {task.priority}
          </Badge>
          <Badge variant={task.status === "done" ? "success" : "default"}>
            {task.status.replace("_", " ")}
          </Badge>
        </div>
        {task.description ? (
          <p className="mt-1 text-sm text-[var(--mentra-muted)]">
            {task.description}
          </p>
        ) : null}
        {studentName ? (
          <p className="mt-1 text-xs text-[var(--mentra-muted)]">
            Student · {studentName}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {task.status !== "open" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              dispatch(setTaskStatus({ id: task.id, status: "open" }))
            }
          >
            <Circle className="h-3.5 w-3.5" /> Open
          </Button>
        ) : null}
        {task.status !== "in_progress" ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              dispatch(setTaskStatus({ id: task.id, status: "in_progress" }))
            }
          >
            <Loader2 className="h-3.5 w-3.5" /> In progress
          </Button>
        ) : null}
        {task.status !== "done" ? (
          <Button
            size="sm"
            onClick={() =>
              dispatch(setTaskStatus({ id: task.id, status: "done" }))
            }
          >
            <Check className="h-3.5 w-3.5" /> Done
          </Button>
        ) : null}
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete task"
          className="text-[var(--mentra-danger)]"
          onClick={() => dispatch(removeTask(task.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
