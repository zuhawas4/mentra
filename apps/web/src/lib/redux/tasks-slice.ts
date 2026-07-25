import { createEntityAdapter, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TaskStatus = "open" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TutorTask {
  id: string;
  title: string;
  description?: string;
  studentId?: string;
  sessionId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const tasksAdapter = createEntityAdapter<TutorTask, string>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
});

function nowIso() {
  return new Date().toISOString();
}

const seed: TutorTask[] = [
  {
    id: "task-1",
    title: "Send Daniel practice set A1–A6",
    description: "Integration by parts worksheet after today's live session.",
    studentId: "student-daniel",
    sessionId: "session-live-calc",
    status: "open",
    priority: "high",
    dueAt: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "task-2",
    title: "Prep organic chemistry warm-up",
    description: "Functional groups flashcards for Sophia.",
    studentId: "student-sophia",
    sessionId: "session-sophia-today",
    status: "in_progress",
    priority: "medium",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "task-3",
    title: "Review James electric-field diagrams",
    description: "Annotate last board snapshot before the evening session.",
    studentId: "student-james",
    status: "open",
    priority: "medium",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "task-4",
    title: "Archive completed differentiation notes",
    status: "done",
    priority: "low",
    studentId: "student-daniel",
    sessionId: "session-daniel-past",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksAdapter.getInitialState({
    activeTab: "open" as TaskStatus | "all",
    lastUpdatedId: null as string | null,
  }),
  reducers: {
    setActiveTab(state, action: PayloadAction<TaskStatus | "all">) {
      state.activeTab = action.payload;
    },
    addTask(
      state,
      action: PayloadAction<
        Omit<TutorTask, "id" | "createdAt" | "updatedAt" | "status"> & {
          status?: TaskStatus;
        }
      >,
    ) {
      const stamp = nowIso();
      const task: TutorTask = {
        id: `task-${Date.now()}`,
        status: action.payload.status ?? "open",
        createdAt: stamp,
        updatedAt: stamp,
        ...action.payload,
      };
      tasksAdapter.addOne(state, task);
      state.lastUpdatedId = task.id;
    },
    /** Patch a single task — does not replace the full entity collection */
    updateTask(
      state,
      action: PayloadAction<{ id: string; changes: Partial<TutorTask> }>,
    ) {
      const { id, changes } = action.payload;
      if (!state.entities[id]) return;
      tasksAdapter.updateOne(state, {
        id,
        changes: { ...changes, updatedAt: nowIso() },
      });
      state.lastUpdatedId = id;
    },
    setTaskStatus(
      state,
      action: PayloadAction<{ id: string; status: TaskStatus }>,
    ) {
      const { id, status } = action.payload;
      if (!state.entities[id]) return;
      tasksAdapter.updateOne(state, {
        id,
        changes: { status, updatedAt: nowIso() },
      });
      state.lastUpdatedId = id;
    },
    removeTask(state, action: PayloadAction<string>) {
      tasksAdapter.removeOne(state, action.payload);
      if (state.lastUpdatedId === action.payload) state.lastUpdatedId = null;
    },
    hydrateTasks(state, action: PayloadAction<TutorTask[]>) {
      tasksAdapter.setAll(state, action.payload);
    },
  },
});

export const {
  setActiveTab,
  addTask,
  updateTask,
  setTaskStatus,
  removeTask,
  hydrateTasks,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;

export const tasksSelectors = tasksAdapter.getSelectors();

export const demoSeedTasks = seed;
