import { NextResponse } from "next/server";
import { isPrismaConfigured } from "@/lib/db/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  return NextResponse.json({
    ok: true,
    demo: !isSupabaseConfigured(),
    supabase: isSupabaseConfigured(),
    prisma: isPrismaConfigured(),
    mode:
      isSupabaseConfigured() && isPrismaConfigured()
        ? "supabase+prisma"
        : "demo",
  });
}
