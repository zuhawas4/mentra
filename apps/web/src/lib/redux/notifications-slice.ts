import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LiveNotificationKind =
  | "session_live"
  | "session_ended"
  | "student_joined"
  | "chat"
  | "task"
  | "system";

export interface LiveNotification {
  id: string;
  kind: LiveNotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

interface NotificationsState {
  items: LiveNotification[];
  connected: boolean;
  transport: "demo-bus" | "supabase" | "offline";
}

function minutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

const seedNotifications: LiveNotification[] = [
  {
    id: "seed-1",
    kind: "session_live",
    title: "Session is live",
    body: "Calculus — Integration by parts just started",
    createdAt: minutesAgo(8),
    read: false,
    href: "/room/session-live-calc",
  },
  {
    id: "seed-2",
    kind: "student_joined",
    title: "Student joined",
    body: "Daniel Miller is on the whiteboard",
    createdAt: minutesAgo(6),
    read: false,
    href: "/room/session-live-calc",
  },
  {
    id: "seed-3",
    kind: "task",
    title: "Task reminder",
    body: "Send Daniel practice set A1–A6",
    createdAt: minutesAgo(45),
    read: true,
    href: "/tasks",
  },
  {
    id: "seed-4",
    kind: "system",
    title: "Notes saved",
    body: "Session notes were added for Sophia Khan",
    createdAt: minutesAgo(70),
    read: true,
    href: "/students/student-sophia",
  },
];

const initialState: NotificationsState = {
  items: seedNotifications,
  connected: false,
  transport: "offline",
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setRealtimeStatus(
      state,
      action: PayloadAction<{
        connected: boolean;
        transport: NotificationsState["transport"];
      }>,
    ) {
      state.connected = action.payload.connected;
      state.transport = action.payload.transport;
    },
    pushNotification(
      state,
      action: PayloadAction<Omit<LiveNotification, "id" | "createdAt" | "read">>,
    ) {
      state.items.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
      state.items = state.items.slice(0, 40);
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllNotificationsRead(state) {
      for (const item of state.items) item.read = true;
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const {
  setRealtimeStatus,
  pushNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationsSlice.actions;

export const notificationsReducer = notificationsSlice.reducer;
