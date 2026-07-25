import { NextResponse } from "next/server";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapStudent } from "@/lib/db/mappers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing || existing.tutorId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as Partial<{
    fullName: string;
    email: string;
    subjects: string[];
    notes: string;
    progress: number;
    status: string;
    avatarUrl: string;
  }>;

  const row = await prisma.student.update({
    where: { id },
    data: {
      fullName: body.fullName,
      email: body.email,
      subjects: body.subjects,
      notes: body.notes,
      progress: body.progress,
      status: body.status,
      avatarUrl: body.avatarUrl,
    },
  });

  return NextResponse.json({ student: mapStudent(row) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing || existing.tutorId !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
