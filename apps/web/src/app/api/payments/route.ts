import { NextResponse } from "next/server";
import type { PaymentStatus } from "@prisma/client";
import { optionsCors, withCors } from "@/lib/api/cors";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapPayment } from "@/lib/db/mappers";

export function OPTIONS(request: Request) {
  return optionsCors(request);
}

export async function GET(request: Request) {
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return withCors(request, ctx.error);

  const { profile, prisma } = ctx;
  if (profile.role !== "tutor") {
    return withCors(
      request,
      NextResponse.json({ error: "Only tutors can view invoices" }, { status: 403 }),
    );
  }

  const rows = await prisma.paymentInvoice.findMany({
    where: { tutorId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return withCors(
    request,
    NextResponse.json({ payments: rows.map(mapPayment) }),
  );
}

export async function POST(request: Request) {
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return withCors(request, ctx.error);

  const { profile, prisma } = ctx;
  if (profile.role !== "tutor") {
    return withCors(
      request,
      NextResponse.json({ error: "Only tutors can create invoices" }, { status: 403 }),
    );
  }

  const body = (await request.json()) as {
    studentId?: string;
    studentName?: string;
    title?: string;
    amountCents?: number;
    currency?: string;
    status?: PaymentStatus;
    dueAt?: string;
    notes?: string;
  };

  if (!body.studentName?.trim() || !body.title?.trim()) {
    return withCors(
      request,
      NextResponse.json(
        { error: "studentName and title are required" },
        { status: 400 },
      ),
    );
  }

  const amountCents = Number(body.amountCents ?? 0);
  if (!Number.isFinite(amountCents) || amountCents < 0) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid amount" }, { status: 400 }),
    );
  }

  const row = await prisma.paymentInvoice.create({
    data: {
      tutorId: profile.id,
      studentId: body.studentId || null,
      studentName: body.studentName.trim(),
      title: body.title.trim(),
      amountCents: Math.round(amountCents),
      currency: body.currency?.trim() || "USD",
      status: body.status ?? "sent",
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      notes: body.notes?.trim() || null,
      paidAt: body.status === "paid" ? new Date() : null,
    },
  });

  return withCors(
    request,
    NextResponse.json({ payment: mapPayment(row) }, { status: 201 }),
  );
}
