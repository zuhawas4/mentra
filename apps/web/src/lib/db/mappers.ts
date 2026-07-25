import type {
  BoardStroke as PrismaStroke,
  ChatMessage as PrismaChat,
  PaymentInvoice as PrismaPayment,
  Profile as PrismaProfile,
  SessionNote as PrismaNote,
  Student as PrismaStudent,
  StudySession as PrismaSession,
} from "@prisma/client";
import type {
  BoardStroke,
  PaymentInvoice,
  SessionNote,
  Student,
  StudySession,
  User,
} from "@mentra/shared";

export function mapProfile(p: PrismaProfile): User {
  return {
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    role: p.role,
    avatarUrl: p.avatarUrl ?? undefined,
    primarySubject: p.primarySubject ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

export function mapStudent(s: PrismaStudent): Student {
  return {
    id: s.id,
    tutorId: s.tutorId,
    userId: s.userId ?? undefined,
    fullName: s.fullName,
    email: s.email ?? undefined,
    avatarUrl: s.avatarUrl ?? undefined,
    subjects: s.subjects,
    notes: s.notes ?? undefined,
    progress: s.progress,
    status: (s.status as Student["status"]) || "active",
    createdAt: s.createdAt.toISOString(),
  };
}

export function mapSession(s: PrismaSession): StudySession {
  return {
    id: s.id,
    tutorId: s.tutorId,
    studentId: s.studentId ?? undefined,
    title: s.title,
    topic: s.topic ?? undefined,
    scheduledAt: s.scheduledAt.toISOString(),
    startedAt: s.startedAt?.toISOString(),
    endedAt: s.endedAt?.toISOString(),
    durationMinutes: s.durationMinutes ?? 60,
    status: s.status,
    guestJoinCode: s.guestJoinCode ?? undefined,
    boardSnapshotUrl: s.boardSnapshotUrl ?? undefined,
    agenda: s.agenda ?? undefined,
    createdAt: s.createdAt.toISOString(),
  };
}

export function mapNote(n: PrismaNote): SessionNote {
  return {
    id: n.id,
    sessionId: n.sessionId,
    authorId: n.authorId,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export function mapStroke(s: PrismaStroke): BoardStroke {
  return {
    id: s.id,
    authorId: s.authorId,
    points: s.points as BoardStroke["points"],
    color: s.color,
    width: Number(s.width),
    tool: s.tool as BoardStroke["tool"],
    createdAt: s.createdAt.toISOString(),
  };
}

export type ApiChatMessage = {
  id: string;
  sessionId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export function mapChat(m: PrismaChat): ApiChatMessage {
  return {
    id: m.id,
    sessionId: m.sessionId,
    authorId: m.authorId,
    authorName: m.authorName,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  };
}

export function mapPayment(p: PrismaPayment): PaymentInvoice {
  return {
    id: p.id,
    tutorId: p.tutorId,
    studentId: p.studentId ?? undefined,
    studentName: p.studentName,
    title: p.title,
    amountCents: p.amountCents,
    currency: p.currency,
    status: p.status,
    dueAt: p.dueAt?.toISOString(),
    paidAt: p.paidAt?.toISOString(),
    notes: p.notes ?? undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
