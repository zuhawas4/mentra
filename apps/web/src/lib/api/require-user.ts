import { NextResponse } from "next/server";
import { getPrisma, isPrismaConfigured } from "@/lib/db/prisma";
import { createServerSupabase } from "@/lib/supabase/server";

export async function requirePrismaUser() {
  if (!isPrismaConfigured()) {
    return {
      error: NextResponse.json(
        { error: "DATABASE_URL not configured. Demo mode uses the local store." },
        { status: 503 },
      ),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      ),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const prisma = getPrisma();
  let profile = await prisma.profile.findUnique({ where: { id: user.id } });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        fullName:
          (user.user_metadata?.full_name as string | undefined) ||
          user.email?.split("@")[0] ||
          "Mentra user",
        role:
          user.user_metadata?.role === "student" ? "student" : "tutor",
        primarySubject: user.user_metadata?.primary_subject as
          | string
          | undefined,
      },
    });
  }

  return { user, profile, prisma };
}
