export type UserRole = "tutor" | "student";

export type SessionStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  primarySubject?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  tutorId: string;
  userId?: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  subjects: string[];
  notes?: string;
  progress?: number;
  status?: "active" | "paused" | "archived";
  createdAt: string;
}

export interface StudySession {
  id: string;
  tutorId: string;
  studentId?: string;
  title: string;
  topic?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  status: SessionStatus;
  guestJoinCode?: string;
  boardData?: unknown;
  boardSnapshotUrl?: string;
  agenda?: string;
  createdAt: string;
}

export interface SessionNote {
  id: string;
  sessionId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  createdAt: string;
  studentId?: string;
}

export interface BoardStroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: "pen" | "eraser";
  authorId: string;
  createdAt: string;
}

export interface SessionParticipant {
  id: string;
  name: string;
  role: UserRole | "guest";
  online: boolean;
  color: string;
}

export interface NotificationPrefs {
  sessionReminders: boolean;
  studentJoined: boolean;
  weeklyDigest: boolean;
}

export type PaymentStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface PaymentInvoice {
  id: string;
  tutorId: string;
  studentId?: string;
  studentName: string;
  title: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  dueAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
