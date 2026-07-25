import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { requirePrismaUser } from "@/lib/api/require-user";
import { mapChat } from "@/lib/db/mappers";

type Params = { params: Promise<{ id: string }> };

async function canAccessSession(
  prisma: PrismaClient,
  profileId: string,
  sessionId: string,
) {
  const session = await prisma.studySession.findUnique({
    where: { id: sessionId },
    include: { student: true },
  });
  if (!session) return null;
  if (session.tutorId === profileId) return session;
  if (session.student?.userId === profileId) return session;
  return null;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const session = await canAccessSession(prisma, profile.id, id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await prisma.chatMessage.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({ messages: rows.map(mapChat) });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requirePrismaUser();
  if ("error" in ctx && ctx.error) return ctx.error;

  const { profile, prisma } = ctx;
  const session = await canAccessSession(prisma, profile.id, id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { body?: string };
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const row = await prisma.chatMessage.create({
    data: {
      sessionId: id,
      authorId: profile.id,
      authorName: profile.fullName,
      body: body.body.trim().slice(0, 2000),
    },
  });

  return NextResponse.json({ message: mapChat(row) }, { status: 201 });
}
