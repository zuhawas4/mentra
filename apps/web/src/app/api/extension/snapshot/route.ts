import { NextResponse } from "next/server";
import {
  demoPayments,
  demoSessions,
  demoStudents,
} from "@mentra/shared";
import { optionsCors, withCors } from "@/lib/api/cors";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapPayment, mapSession, mapStudent } from "@/lib/db/mappers";
import { isPrismaConfigured } from "@/lib/db/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function OPTIONS(request: Request) {
  return optionsCors(request);
}

function summarizePayments(
  payments: Array<{
    amountCents: number;
    status: string;
    studentName: string;
    title: string;
    id: string;
    currency: string;
    dueAt?: string | null;
  }>,
) {
  const paid = payments.filter((p) => p.status === "paid");
  const open = payments.filter((p) =>
    ["sent", "overdue", "draft"].includes(p.status),
  );
  return {
    invoiceCount: payments.length,
    paidCents: paid.reduce((sum, p) => sum + p.amountCents, 0),
    openCents: open.reduce((sum, p) => sum + p.amountCents, 0),
    overdueCount: payments.filter((p) => p.status === "overdue").length,
    recent: payments.slice(0, 8),
  };
}

/** Chrome extension + clients: app data snapshot (demo or authenticated Prisma). */
export async function GET(request: Request) {
  const base = {
    supabase: isSupabaseConfigured(),
    prisma: isPrismaConfigured(),
    generatedAt: new Date().toISOString(),
  };

  if (isPrismaConfigured()) {
    const ctx = await requirePrismaUser();
    if (!("error" in ctx && ctx.error)) {
      const { profile, prisma } = ctx;
      const [students, sessions, payments] = await Promise.all([
        prisma.student.findMany({
          where: { tutorId: profile.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.studySession.findMany({
          where: { tutorId: profile.id },
          orderBy: { scheduledAt: "desc" },
          take: 20,
        }),
        prisma.paymentInvoice.findMany({
          where: { tutorId: profile.id },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const mappedPayments = payments.map(mapPayment);
      return withCors(
        request,
        NextResponse.json({
          ...base,
          mode: "authenticated",
          tutor: { id: profile.id, fullName: profile.fullName },
          students: students.map(mapStudent),
          sessions: sessions.map(mapSession),
          payments: summarizePayments(mappedPayments),
          invoices: mappedPayments,
        }),
      );
    }
  }

  // Demo snapshot — always available so the extension works without login.
  return withCors(
    request,
    NextResponse.json({
      ...base,
      mode: "demo",
      tutor: { id: "tutor-amelia", fullName: "Amelia Rose" },
      students: demoStudents,
      sessions: demoSessions.slice(0, 8),
      payments: summarizePayments(demoPayments),
      invoices: demoPayments,
      note: "Demo snapshot. Configure Supabase + Prisma and sign in for live data.",
    }),
  );
}
