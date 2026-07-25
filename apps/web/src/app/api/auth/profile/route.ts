import { NextResponse } from "next/server";
import { mapProfile } from "@/lib/db/mappers";
import { getPrisma, isPrismaConfigured } from "@/lib/db/prisma";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: "Prisma not configured" }, { status: 503 });
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: mapProfile(profile) });
}

export async function POST(request: Request) {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: "Prisma not configured" }, { status: 503 });
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    role?: "tutor" | "student";
    primarySubject?: string;
    avatarUrl?: string;
  };

  const prisma = getPrisma();
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      fullName:
        body.fullName?.trim() ||
        (user.user_metadata?.full_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "Mentra user",
      role: body.role === "student" ? "student" : "tutor",
      primarySubject: body.primarySubject,
      avatarUrl: body.avatarUrl,
    },
    update: {
      fullName: body.fullName?.trim() || undefined,
      role: body.role,
      primarySubject: body.primarySubject,
      avatarUrl: body.avatarUrl,
      email: user.email ?? undefined,
    },
  });

  return NextResponse.json({ profile: mapProfile(profile) });
}
