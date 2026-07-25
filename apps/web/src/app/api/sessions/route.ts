import { NextResponse } from "next/server";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapSession } from "@/lib/db/mappers";

function randomJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export async function GET() {
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const rows =
    profile.role === "tutor"
      ? await prisma.studySession.findMany({
          where: { tutorId: profile.id },
          orderBy: { scheduledAt: "asc" },
        })
      : await prisma.studySession.findMany({
          where: { student: { userId: profile.id } },
          orderBy: { scheduledAt: "asc" },
        });

  return NextResponse.json({ sessions: rows.map(mapSession) });
}

export async function POST(request: Request) {
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  if (profile.role !== "tutor") {
    return NextResponse.json({ error: "Only tutors can create sessions" }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    topic?: string;
    studentId?: string;
    scheduledAt?: string;
    durationMinutes?: number;
    agenda?: string;
    createGuestLink?: boolean;
  };

  if (!body.title?.trim() || !body.scheduledAt) {
    return NextResponse.json(
      { error: "title and scheduledAt are required" },
      { status: 400 },
    );
  }

  const row = await prisma.studySession.create({
    data: {
      tutorId: profile.id,
      studentId: body.studentId || null,
      title: body.title.trim(),
      topic: body.topic?.trim() || null,
      scheduledAt: new Date(body.scheduledAt),
      durationMinutes: body.durationMinutes ?? 60,
      agenda: body.agenda ?? null,
      guestJoinCode: body.createGuestLink === false ? null : randomJoinCode(),
      status: "scheduled",
    },
  });

  return NextResponse.json({ session: mapSession(row) }, { status: 201 });
}
