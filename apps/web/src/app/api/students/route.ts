import { NextResponse } from "next/server";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapStudent } from "@/lib/db/mappers";

export async function GET() {
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const rows =
    profile.role === "tutor"
      ? await prisma.student.findMany({
          where: { tutorId: profile.id },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.student.findMany({
          where: { userId: profile.id },
          orderBy: { createdAt: "desc" },
        });

  return NextResponse.json({ students: rows.map(mapStudent) });
}

export async function POST(request: Request) {
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  if (profile.role !== "tutor") {
    return NextResponse.json({ error: "Only tutors can add students" }, { status: 403 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    subjects?: string[];
    notes?: string;
    progress?: number;
    status?: string;
  };

  if (!body.fullName?.trim()) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  const row = await prisma.student.create({
    data: {
      tutorId: profile.id,
      fullName: body.fullName.trim(),
      email: body.email?.trim() || null,
      subjects: body.subjects ?? [],
      notes: body.notes ?? null,
      progress: body.progress ?? 0,
      status: body.status ?? "active",
    },
  });

  return NextResponse.json({ student: mapStudent(row) }, { status: 201 });
}
