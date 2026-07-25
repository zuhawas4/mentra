import { NextResponse } from "next/server";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapStroke } from "@/lib/db/mappers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const session = await prisma.studySession.findUnique({
    where: { id },
    include: { student: true },
  });
  if (
    !session ||
    (session.tutorId !== profile.id && session.student?.userId !== profile.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await prisma.boardStroke.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ strokes: rows.map(mapStroke) });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const session = await prisma.studySession.findUnique({
    where: { id },
    include: { student: true },
  });
  if (
    !session ||
    (session.tutorId !== profile.id && session.student?.userId !== profile.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    points?: number[];
    color?: string;
    width?: number;
    tool?: "pen" | "eraser";
  };

  if (!body.points?.length || !body.color || !body.width || !body.tool) {
    return NextResponse.json({ error: "Invalid stroke" }, { status: 400 });
  }

  const row = await prisma.boardStroke.create({
    data: {
      sessionId: id,
      authorId: profile.id,
      points: body.points,
      color: body.color,
      width: body.width,
      tool: body.tool,
    },
  });

  return NextResponse.json({ stroke: mapStroke(row) }, { status: 201 });
}
