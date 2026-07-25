import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { tasksSelectors, type TaskStatus } from "./tasks-slice";

const selectTasksState = (state: RootState) => state.tasks;

export const selectAllTasks = (state: RootState) =>
  tasksSelectors.selectAll(state.tasks);

export const selectTaskById = (id: string) => (state: RootState) =>
  tasksSelectors.selectById(state.tasks, id);

export const selectActiveTab = (state: RootState) => state.tasks.activeTab;

export const selectLastUpdatedTaskId = (state: RootState) =>
  state.tasks.lastUpdatedId;

/** Memoized — tab switches only recompute the filtered list, not other slices */
export const selectTasksForActiveTab = createSelector(
  [selectAllTasks, selectActiveTab],
  (tasks, tab) => {
    if (tab === "all") return tasks;
    return tasks.filter((t) => t.status === tab);
  },
);

export const selectTaskCounts = createSelector([selectAllTasks], (tasks) => {
  const counts: Record<TaskStatus | "all", number> = {
    all: tasks.length,
    open: 0,
    in_progress: 0,
    done: 0,
  };
  for (const task of tasks) counts[task.status] += 1;
  return counts;
});

export const selectOpenTaskCount = createSelector(
  [selectTaskCounts],
  (counts) => counts.open + counts.in_progress,
);

export { selectTasksState };
