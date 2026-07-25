"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserRole } from "@mentra/shared";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canUseSupabaseAuth,
  supabaseSignUp,
} from "@/lib/auth/supabase-auth";
import { useRecaptchaAction } from "@/lib/hooks/use-recaptcha-action";
import { hydrateFromApi } from "@/lib/data/hydrate-from-api";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const signup = useDemoStore((s) => s.signup);
  const completeLogin = useDemoStore((s) => s.completeLogin);
  const { runWithRecaptcha, verifying } = useRecaptchaAction("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("tutor");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const outcome = await runWithRecaptcha(async () => {
      if (canUseSupabaseAuth()) {
        return supabaseSignUp({ fullName, email, password, role });
      }
      return signup({ fullName, email, password, role });
    });

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    if (!outcome.result.ok) {
      setError(
        "error" in outcome.result
          ? (outcome.result.error ?? "Unable to create account.")
          : "Unable to create account.",
      );
      return;
    }

    if (canUseSupabaseAuth() && "user" in outcome.result && outcome.result.user) {
      completeLogin(outcome.result.user);
      await hydrateFromApi();
    }

    toast.success("Account created");
    router.push(role === "tutor" ? "/dashboard" : "/student");
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create your Mentra account</CardTitle>
          <p className="text-sm text-[var(--mentra-muted)]">
            Tutors are the primary path — students can also join via session links.
            Protected by reCAPTCHA v3.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F1F1F6] p-1">
              {(
                [
                  ["tutor", "I'm a tutor"],
                  ["student", "I'm a student"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    role === value
                      ? "bg-white text-[var(--mentra-ink)] shadow-sm"
                      : "text-[var(--mentra-muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-[var(--mentra-danger-soft)] px-3 py-2 text-sm text-[var(--mentra-danger)]">
                {error}
              </p>
            ) : null}
            <Button className="w-full" type="submit" disabled={verifying}>
              {verifying ? "Verifying…" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--mentra-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--mentra-primary)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
