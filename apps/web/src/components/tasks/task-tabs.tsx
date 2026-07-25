"use client";

import { setActiveTab, type TaskStatus } from "@/lib/redux/tasks-slice";
import {
  selectActiveTab,
  selectTaskCounts,
} from "@/lib/redux/tasks-selectors";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

const tabs: Array<{ id: TaskStatus | "all"; label: string }> = [
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
];

/** Tab bar reads only tab + counts — changing a task status won't remount unrelated tabs unnecessarily */
export function TaskTabs() {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectActiveTab);
  const counts = useAppSelector(selectTaskCounts);

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => dispatch(setActiveTab(tab.id))}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition",
            active === tab.id
              ? "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]"
              : "border border-[var(--mentra-border)] bg-white text-[var(--mentra-muted)]",
          )}
        >
          {tab.label}
          <span className="ml-1.5 tabular-nums opacity-70">
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
