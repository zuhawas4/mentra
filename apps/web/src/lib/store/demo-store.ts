"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEMO_PASSWORD,
  demoActivity,
  demoNotes,
  demoPayments,
  demoResources,
  demoSessions,
  demoStudentUser,
  demoStudents,
  demoTutor,
  type ActivityItem,
  type BoardStroke,
  type NotificationPrefs,
  type PaymentInvoice,
  type SessionNote,
  type SessionStatus,
  type Student,
  type StudySession,
  type User,
  type UserRole,
} from "@mentra/shared";
import { generateJoinCode } from "@/lib/utils";

interface DemoState {
  hydrated: boolean;
  user: User | null;
  students: Student[];
  sessions: StudySession[];
  notes: SessionNote[];
  activity: ActivityItem[];
  resources: typeof demoResources;
  payments: PaymentInvoice[];
  boards: Record<string, BoardStroke[]>;
  notificationPrefs: NotificationPrefs;
  setHydrated: (v: boolean) => void;
  /** Validates credentials without establishing a session (supports 2FA gate). */
  authenticate: (
    email: string,
    password: string,
  ) => { ok: boolean; user?: User; error?: string };
  /** Establishes the authenticated session after password (+ optional 2FA). */
  completeLogin: (user: User) => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (input: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => { ok: boolean; error?: string };
  logout: () => void;
  enterDemoAsTutor: () => void;
  enterDemoAsStudent: () => void;
  updateProfile: (patch: Partial<User>) => void;
  setNotificationPrefs: (prefs: NotificationPrefs) => void;
  addStudent: (input: Omit<Student, "id" | "tutorId" | "createdAt">) => Student;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addSession: (
    input: Omit<StudySession, "id" | "tutorId" | "createdAt" | "guestJoinCode"> & {
      createGuestLink?: boolean;
    },
  ) => StudySession;
  updateSession: (id: string, patch: Partial<StudySession>) => void;
  setSessionStatus: (id: string, status: SessionStatus) => void;
  upsertNote: (sessionId: string, content: string, authorId: string) => void;
  getNoteForSession: (sessionId: string) => SessionNote | undefined;
  setBoard: (sessionId: string, strokes: BoardStroke[]) => void;
  appendStroke: (sessionId: string, stroke: BoardStroke) => void;
  addPayment: (
    input: Omit<PaymentInvoice, "id" | "tutorId" | "createdAt" | "updatedAt">,
  ) => PaymentInvoice;
  updatePayment: (id: string, patch: Partial<PaymentInvoice>) => void;
  deletePayment: (id: string) => void;
  findSessionByCode: (code: string) => StudySession | undefined;
  resetDemoData: () => void;
}

function cloneDemo() {
  return {
    students: structuredClone(demoStudents),
    sessions: structuredClone(demoSessions),
    notes: structuredClone(demoNotes),
    activity: structuredClone(demoActivity),
    resources: structuredClone(demoResources),
    payments: structuredClone(demoPayments),
    boards: {} as Record<string, BoardStroke[]>,
  };
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      ...cloneDemo(),
      notificationPrefs: {
        sessionReminders: true,
        studentJoined: true,
        weeklyDigest: false,
      },
      setHydrated: (v) => set({ hydrated: v }),
      authenticate: (email, password) => {
        const normalized = email.trim().toLowerCase();
        if (password !== DEMO_PASSWORD) {
          return { ok: false, error: "Invalid email or password." };
        }
        if (
          normalized === demoTutor.email.toLowerCase() ||
          normalized === "tutor@mentra.app"
        ) {
          return { ok: true, user: demoTutor };
        }
        if (
          normalized === demoStudentUser.email.toLowerCase() ||
          normalized === "student@mentra.app"
        ) {
          return { ok: true, user: demoStudentUser };
        }
        const existing = get().user;
        if (existing && existing.email.toLowerCase() === normalized) {
          return { ok: true, user: existing };
        }
        return {
          ok: false,
          error:
            "Demo accounts: amelia@mentra.app or daniel@student.app (password: demo1234).",
        };
      },
      completeLogin: (user) => set({ user }),
      login: (email, password) => {
        const result = get().authenticate(email, password);
        if (!result.ok || !result.user) {
          return { ok: false, error: result.error };
        }
        set({ user: result.user });
        return { ok: true };
      },
      signup: ({ fullName, email, password, role }) => {
        if (!fullName.trim() || !email.trim() || password.length < 6) {
          return {
            ok: false,
            error: "Please fill all fields. Password must be at least 6 characters.",
          };
        }
        const user: User = {
          id: `user-${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          role,
          primarySubject: role === "tutor" ? "General tutoring" : undefined,
          createdAt: new Date().toISOString(),
        };
        set({ user });
        return { ok: true };
      },
      logout: () => {
        void import("@/lib/auth/supabase-auth").then((m) => m.supabaseSignOut());
        set({ user: null });
      },
      enterDemoAsTutor: () => set({ user: demoTutor, ...cloneDemo() }),
      enterDemoAsStudent: () => set({ user: demoStudentUser }),
      updateProfile: (patch) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...patch } });
      },
      setNotificationPrefs: (prefs) => set({ notificationPrefs: prefs }),
      addStudent: (input) => {
        const user = get().user;
        const student: Student = {
          id: `student-${Date.now()}`,
          tutorId: user?.id ?? demoTutor.id,
          createdAt: new Date().toISOString(),
          progress: 0,
          status: "active",
          ...input,
        };
        set((s) => ({ students: [student, ...s.students] }));
        void import("@/lib/data/remote-crud").then(({ remoteCreateStudent }) =>
          remoteCreateStudent(input).then((remote) => {
            if (!remote) return;
            set((s) => ({
              students: s.students.map((st) =>
                st.id === student.id ? remote : st,
              ),
            }));
          }),
        );
        return student;
      },
      updateStudent: (id, patch) => {
        set((s) => ({
          students: s.students.map((st) =>
            st.id === id ? { ...st, ...patch } : st,
          ),
        }));
        void import("@/lib/data/remote-crud").then(({ remoteUpdateStudent }) =>
          remoteUpdateStudent(id, patch),
        );
      },
      deleteStudent: (id) => {
        set((s) => ({
          students: s.students.filter((st) => st.id !== id),
          sessions: s.sessions.filter((sess) => sess.studentId !== id),
        }));
        void import("@/lib/data/remote-crud").then(({ remoteDeleteStudent }) =>
          remoteDeleteStudent(id),
        );
      },
      addSession: (input) => {
        const user = get().user;
        const { createGuestLink, ...rest } = input;
        const session: StudySession = {
          id: `session-${Date.now()}`,
          tutorId: user?.id ?? demoTutor.id,
          createdAt: new Date().toISOString(),
          guestJoinCode: createGuestLink === false ? undefined : generateJoinCode(),
          ...rest,
        };
        set((s) => ({
          sessions: [session, ...s.sessions],
          activity: [
            {
              id: `act-${Date.now()}`,
              message: `New session scheduled: ${session.title}`,
              createdAt: new Date().toISOString(),
              studentId: session.studentId,
            },
            ...s.activity,
          ],
        }));
        void import("@/lib/data/remote-crud").then(({ remoteCreateSession }) =>
          remoteCreateSession({
            title: session.title,
            topic: session.topic,
            studentId: session.studentId,
            scheduledAt: session.scheduledAt,
            durationMinutes: session.durationMinutes,
            agenda: session.agenda,
            createGuestLink,
          }).then((remote) => {
            if (!remote) return;
            set((s) => ({
              sessions: s.sessions.map((sess) =>
                sess.id === session.id ? remote : sess,
              ),
            }));
          }),
        );
        return session;
      },
      updateSession: (id, patch) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, ...patch } : sess,
          ),
        }));
        void import("@/lib/data/remote-crud").then(({ remoteUpdateSession }) =>
          remoteUpdateSession(id, patch),
        );
      },
      setSessionStatus: (id, status) => {
        const now = new Date().toISOString();
        const prev = get().sessions.find((s) => s.id === id);
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== id) return sess;
            return {
              ...sess,
              status,
              startedAt:
                status === "live" ? sess.startedAt ?? now : sess.startedAt,
              endedAt: status === "completed" ? now : sess.endedAt,
            };
          }),
          activity:
            prev && prev.status !== status
              ? [
                  {
                    id: `act-${Date.now()}`,
                    message:
                      status === "live"
                        ? `Session went live: ${prev.title}`
                        : status === "completed"
                          ? `Session completed: ${prev.title}`
                          : `Session updated: ${prev.title}`,
                    createdAt: now,
                    studentId: prev.studentId,
                  },
                  ...s.activity,
                ]
              : s.activity,
        }));
        void import("@/lib/data/remote-crud").then(({ remoteUpdateSession }) =>
          remoteUpdateSession(id, {
            status,
            startedAt:
              status === "live" ? prev?.startedAt ?? now : prev?.startedAt,
            endedAt: status === "completed" ? now : prev?.endedAt,
          }),
        );
      },
      upsertNote: (sessionId, content, authorId) => {
        const existing = get().notes.find((n) => n.sessionId === sessionId);
        const now = new Date().toISOString();
        if (existing) {
          set((s) => ({
            notes: s.notes.map((n) =>
              n.id === existing.id
                ? { ...n, content, updatedAt: now }
                : n,
            ),
          }));
        } else {
          set((s) => ({
            notes: [
              {
                id: `note-${Date.now()}`,
                sessionId,
                authorId,
                content,
                createdAt: now,
                updatedAt: now,
              },
              ...s.notes,
            ],
          }));
        }
      },
      getNoteForSession: (sessionId) =>
        get().notes.find((n) => n.sessionId === sessionId),
      setBoard: (sessionId, strokes) =>
        set((s) => ({ boards: { ...s.boards, [sessionId]: strokes } })),
      appendStroke: (sessionId, stroke) =>
        set((s) => ({
          boards: {
            ...s.boards,
            [sessionId]: [...(s.boards[sessionId] ?? []), stroke],
          },
        })),
      addPayment: (input) => {
        const user = get().user;
        const now = new Date().toISOString();
        const payment: PaymentInvoice = {
          id: `pay-${Date.now()}`,
          tutorId: user?.id ?? demoTutor.id,
          createdAt: now,
          updatedAt: now,
          ...input,
        };
        set((s) => ({ payments: [payment, ...s.payments] }));
        void import("@/lib/data/remote-crud").then(({ remoteCreatePayment }) =>
          remoteCreatePayment(input).then((remote) => {
            if (!remote) return;
            set((s) => ({
              payments: s.payments.map((p) =>
                p.id === payment.id ? remote : p,
              ),
            }));
          }),
        );
        return payment;
      },
      updatePayment: (id, patch) => {
        const now = new Date().toISOString();
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: now } : p,
          ),
        }));
        void import("@/lib/data/remote-crud").then(({ remoteUpdatePayment }) =>
          remoteUpdatePayment(id, { ...patch, updatedAt: now }),
        );
      },
      deletePayment: (id) => {
        set((s) => ({ payments: s.payments.filter((p) => p.id !== id) }));
        void import("@/lib/data/remote-crud").then(({ remoteDeletePayment }) =>
          remoteDeletePayment(id),
        );
      },
      findSessionByCode: (code) => {
        const normalized = code.trim().toUpperCase();
        return get().sessions.find(
          (s) =>
            s.guestJoinCode?.toUpperCase() === normalized ||
            s.id === code.trim(),
        );
      },
      resetDemoData: () => set({ ...cloneDemo(), user: get().user }),
    }),
    {
      name: "mentra-demo-store",
      partialize: (s) => ({
        user: s.user,
        students: s.students,
        sessions: s.sessions,
        notes: s.notes,
        activity: s.activity,
        resources: s.resources,
        payments: s.payments,
        boards: s.boards,
        notificationPrefs: s.notificationPrefs,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.payments?.length) {
          state.payments = structuredClone(demoPayments);
        }
        state?.setHydrated(true);
      },
    },
  ),
);

export function useStudentById(id?: string) {
  return useDemoStore((s) => s.students.find((st) => st.id === id));
}

export function useSessionById(id?: string) {
  return useDemoStore((s) => s.sessions.find((sess) => sess.id === id));
}
