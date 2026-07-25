import type {
  ActivityItem,
  PaymentInvoice,
  SessionNote,
  Student,
  StudySession,
  User,
} from "./types";

/** Anchor demo dates to "today" so the dashboard always looks current */
function atToday(hours: number, minutes = 0): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hours = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_PASSWORD = "demo1234";

export const demoTutor: User = {
  id: "tutor-amelia",
  fullName: "Amelia Rose",
  email: "amelia@mentra.app",
  role: "tutor",
  primarySubject: "Mathematics",
  createdAt: daysAgo(120),
};

export const demoStudentUser: User = {
  id: "user-daniel",
  fullName: "Daniel Miller",
  email: "daniel@student.app",
  role: "student",
  createdAt: daysAgo(60),
};

export const demoStudents: Student[] = [
  {
    id: "student-daniel",
    tutorId: demoTutor.id,
    userId: demoStudentUser.id,
    fullName: "Daniel Miller",
    email: "daniel@student.app",
    subjects: ["Calculus", "A-Level Mathematics"],
    notes:
      "Strong algebra foundations. Working on integration techniques and exam pacing.",
    progress: 82,
    status: "active",
    createdAt: daysAgo(55),
  },
  {
    id: "student-sophia",
    tutorId: demoTutor.id,
    fullName: "Sophia Khan",
    email: "sophia@student.app",
    subjects: ["Chemistry", "Organic chemistry"],
    notes: "Needs more practice with reaction mechanisms and naming conventions.",
    progress: 68,
    status: "active",
    createdAt: daysAgo(40),
  },
  {
    id: "student-james",
    tutorId: demoTutor.id,
    fullName: "James Murphy",
    email: "james@student.app",
    subjects: ["Physics", "Electric fields"],
    notes: "Visual learner — whiteboard diagrams help a lot with field concepts.",
    progress: 61,
    status: "active",
    createdAt: daysAgo(30),
  },
];

function minutesFromNow(offset: number): string {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + offset);
  return d.toISOString();
}

export const demoSessions: StudySession[] = [
  {
    id: "session-live-calc",
    tutorId: demoTutor.id,
    studentId: "student-daniel",
    title: "Calculus — Integration by parts",
    topic: "Integration by parts",
    scheduledAt: minutesFromNow(-32),
    startedAt: minutesFromNow(-32),
    durationMinutes: 60,
    status: "live",
    guestJoinCode: "CALC32",
    agenda: "Warm-up → Integration by parts examples → Practice set",
    createdAt: daysAgo(2),
  },
  {
    id: "session-sophia-today",
    tutorId: demoTutor.id,
    studentId: "student-sophia",
    title: "Organic chemistry",
    topic: "Organic chemistry",
    scheduledAt: atToday(14, 30),
    durationMinutes: 45,
    status: "scheduled",
    guestJoinCode: "ORG145",
    agenda: "Functional groups review and naming practice",
    createdAt: daysAgo(3),
  },
  {
    id: "session-james-today",
    tutorId: demoTutor.id,
    studentId: "student-james",
    title: "Electric fields",
    topic: "Electric fields",
    scheduledAt: atToday(16, 0),
    durationMinutes: 60,
    status: "scheduled",
    guestJoinCode: "PHY160",
    agenda: "Field lines, Coulomb's law applications",
    createdAt: daysAgo(1),
  },
  {
    id: "session-daniel-past",
    tutorId: demoTutor.id,
    studentId: "student-daniel",
    title: "Differentiation techniques",
    topic: "Chain rule & product rule",
    scheduledAt: daysAgo(3, 11),
    startedAt: daysAgo(3, 11),
    endedAt: daysAgo(3, 12),
    durationMinutes: 60,
    status: "completed",
    guestJoinCode: "DIFF11",
    boardSnapshotUrl: "/snapshots/demo-board.svg",
    createdAt: daysAgo(5),
  },
  {
    id: "session-sophia-past",
    tutorId: demoTutor.id,
    studentId: "student-sophia",
    title: "Periodic trends",
    topic: "Periodic trends",
    scheduledAt: daysAgo(5, 15),
    startedAt: daysAgo(5, 15),
    endedAt: daysAgo(5, 16),
    durationMinutes: 45,
    status: "completed",
    guestJoinCode: "CHEM55",
    boardSnapshotUrl: "/snapshots/demo-board.svg",
    createdAt: daysAgo(7),
  },
];

export const demoNotes: SessionNote[] = [
  {
    id: "note-1",
    sessionId: "session-live-calc",
    authorId: demoTutor.id,
    content:
      "Daniel is picking up integration by parts quickly. Focus next on choosing u and dv systematically. Assigned practice set A1–A6.",
    createdAt: atToday(10, 15),
    updatedAt: atToday(10, 15),
  },
  {
    id: "note-2",
    sessionId: "session-daniel-past",
    authorId: demoTutor.id,
    content:
      "Solid session on differentiation. Still hesitates on chain rule nesting — review next time before integrals.",
    createdAt: daysAgo(3, 12),
    updatedAt: daysAgo(3, 12),
  },
  {
    id: "note-3",
    sessionId: "session-sophia-past",
    authorId: demoTutor.id,
    content:
      "Covered electronegativity and atomic radius trends. Sophia should redo worksheet 3 before organic intro.",
    createdAt: daysAgo(5, 16),
    updatedAt: daysAgo(5, 16),
  },
];

function minutesAgo(mins: number): string {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}

export const demoActivity: ActivityItem[] = [
  {
    id: "act-1",
    message: "Daniel completed a practice set on integration",
    createdAt: minutesAgo(12),
    studentId: "student-daniel",
  },
  {
    id: "act-2",
    message: "Session notes were added for Sophia Khan",
    createdAt: minutesAgo(60),
    studentId: "student-sophia",
  },
  {
    id: "act-3",
    message: "James Murphy joined Electric fields resources",
    createdAt: minutesAgo(180),
    studentId: "student-james",
  },
  {
    id: "act-4",
    message: "Whiteboard snapshot saved for Differentiation techniques",
    createdAt: minutesAgo(60 * 24 * 3),
    studentId: "student-daniel",
  },
];

export const demoResources = [
  {
    id: "res-1",
    title: "Integration by parts cheatsheet",
    subject: "Calculus",
    updatedAt: daysAgo(1),
  },
  {
    id: "res-2",
    title: "Organic functional groups map",
    subject: "Chemistry",
    updatedAt: daysAgo(4),
  },
  {
    id: "res-3",
    title: "Electric field diagram pack",
    subject: "Physics",
    updatedAt: daysAgo(6),
  },
];

export const demoPayments: PaymentInvoice[] = [
  {
    id: "pay-1",
    tutorId: demoTutor.id,
    studentId: "student-daniel",
    studentName: "Daniel Miller",
    title: "April tutoring package (4 sessions)",
    amountCents: 12000,
    currency: "USD",
    status: "paid",
    dueAt: daysAgo(20),
    paidAt: daysAgo(18),
    notes: "Paid via bank transfer",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(18),
  },
  {
    id: "pay-2",
    tutorId: demoTutor.id,
    studentId: "student-sophia",
    studentName: "Sophia Khan",
    title: "Chemistry intensives — Invoice #1042",
    amountCents: 8500,
    currency: "USD",
    status: "sent",
    dueAt: daysAgo(-5),
    notes: "Awaiting card payment",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "pay-3",
    tutorId: demoTutor.id,
    studentId: "student-james",
    studentName: "James Murphy",
    title: "Physics weekly retainer",
    amountCents: 6000,
    currency: "USD",
    status: "overdue",
    dueAt: daysAgo(7),
    notes: "Send reminder",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(7),
  },
];
