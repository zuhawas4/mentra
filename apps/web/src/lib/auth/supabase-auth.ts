"use client";

import type { User, UserRole } from "@mentra/shared";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function canUseSupabaseAuth() {
  return isSupabaseConfigured();
}

export async function supabaseSignIn(
  email: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Unable to sign in." };
  }

  const meta = data.user.user_metadata ?? {};
  const user: User = {
    id: data.user.id,
    email: data.user.email ?? email,
    fullName:
      (meta.full_name as string | undefined) ||
      email.split("@")[0] ||
      "Mentra user",
    role: meta.role === "student" ? "student" : "tutor",
    avatarUrl: (meta.avatar_url as string | undefined) || undefined,
    primarySubject: (meta.primary_subject as string | undefined) || undefined,
    createdAt: data.user.created_at,
  };

  // Ensure Prisma profile exists (best-effort).
  void fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user.fullName,
      role: user.role,
      primarySubject: user.primarySubject,
    }),
  });

  return { ok: true, user };
}

export async function supabaseSignUp(input: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        role: input.role,
      },
    },
  });

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Unable to sign up." };
  }

  const user: User = {
    id: data.user.id,
    email: data.user.email ?? input.email,
    fullName: input.fullName.trim(),
    role: input.role,
    createdAt: data.user.created_at,
  };

  void fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user.fullName,
      role: user.role,
    }),
  });

  return { ok: true, user };
}

export async function supabaseSignOut() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
