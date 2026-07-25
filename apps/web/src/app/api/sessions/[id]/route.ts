import { NextResponse } from "next/server";
import type { SessionStatus } from "@prisma/client";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapSession } from "@/lib/db/mappers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const row = await prisma.studySession.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowed =
    row.tutorId === profile.id ||
    (await prisma.student.findFirst({
      where: { id: row.studentId ?? "", userId: profile.id },
    }));

  if (!allowed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ session: mapSession(row) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const existing = await prisma.studySession.findUnique({ where: { id } });
  if (!existing || existing.tutorId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as Partial<{
    title: string;
    topic: string;
    studentId: string;
    scheduledAt: string;
    status: SessionStatus;
    agenda: string;
    boardSnapshotUrl: string;
    startedAt: string;
    endedAt: string;
  }>;

  const row = await prisma.studySession.update({
    where: { id },
    data: {
      title: body.title,
      topic: body.topic,
      studentId: body.studentId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      status: body.status,
      agenda: body.agenda,
      boardSnapshotUrl: body.boardSnapshotUrl,
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
      endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
    },
  });

  return NextResponse.json({ session: mapSession(row) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const existing = await prisma.studySession.findUnique({ where: { id } });
  if (!existing || existing.tutorId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.studySession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
