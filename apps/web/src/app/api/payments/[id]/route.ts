import { NextResponse } from "next/server";
import type { PaymentStatus } from "@prisma/client";
import { optionsCors, withCors } from "@/lib/api/cors";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapPayment } from "@/lib/db/mappers";

type Params = { params: Promise<{ id: string }> };

export function OPTIONS(request: Request) {
  return optionsCors(request);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return withCors(request, ctx.error);

  const { profile, prisma } = ctx;
  const existing = await prisma.paymentInvoice.findUnique({ where: { id } });
  if (!existing || existing.tutorId !== profile.id) {
    return withCors(
      request,
      NextResponse.json({ error: "Not found" }, { status: 404 }),
    );
  }

  const body = (await request.json()) as Partial<{
    studentName: string;
    title: string;
    amountCents: number;
    currency: string;
    status: PaymentStatus;
    dueAt: string;
    paidAt: string;
    notes: string;
  }>;

  const row = await prisma.paymentInvoice.update({
    where: { id },
    data: {
      studentName: body.studentName,
      title: body.title,
      amountCents:
        body.amountCents !== undefined
          ? Math.round(Number(body.amountCents))
          : undefined,
      currency: body.currency,
      status: body.status,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      paidAt:
        body.status === "paid"
          ? new Date()
          : body.paidAt
            ? new Date(body.paidAt)
            : undefined,
      notes: body.notes,
    },
  });

  return withCors(request, NextResponse.json({ payment: mapPayment(row) }));
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return withCors(request, ctx.error);

  const { profile, prisma } = ctx;
  const existing = await prisma.paymentInvoice.findUnique({ where: { id } });
  if (!existing || existing.tutorId !== profile.id) {
    return withCors(
      request,
      NextResponse.json({ error: "Not found" }, { status: 404 }),
    );
  }

  await prisma.paymentInvoice.delete({ where: { id } });
  return withCors(request, NextResponse.json({ ok: true }));
}
