"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@mentra/shared";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { TwoFactorChallenge } from "@/components/auth/two-factor-challenge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/skeleton";
import {
  canUseSupabaseAuth,
  supabaseSignIn,
} from "@/lib/auth/supabase-auth";
import { getTwoFactorConfig } from "@/lib/auth/two-factor";
import { useRecaptchaAction } from "@/lib/hooks/use-recaptcha-action";
import { hydrateFromApi } from "@/lib/data/hydrate-from-api";
import { useDemoStore } from "@/lib/store/demo-store";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const authenticate = useDemoStore((s) => s.authenticate);
  const completeLogin = useDemoStore((s) => s.completeLogin);
  const enterDemoAsTutor = useDemoStore((s) => s.enterDemoAsTutor);
  const enterDemoAsStudent = useDemoStore((s) => s.enterDemoAsStudent);
  const { runWithRecaptcha, verifying } = useRecaptchaAction("login");
  const [email, setEmail] = useState("amelia@mentra.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  function redirectForRole(role: "tutor" | "student") {
    const next = params.get("next");
    if (next) {
      router.push(next);
      return;
    }
    router.push(role === "tutor" ? "/dashboard" : "/student");
  }

  async function finishLogin(user: User) {
    completeLogin(user);
    await hydrateFromApi();
    toast.success(`Welcome back, ${user.fullName.split(" ")[0] ?? "there"}`);
    redirectForRole(user.role);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const outcome = await runWithRecaptcha(async () => {
      if (canUseSupabaseAuth()) {
        return supabaseSignIn(email, password);
      }
      return authenticate(email, password);
    });
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }

    const result = outcome.result;
    if (!result.ok || !result.user) {
      setError(
        (!result.ok && "error" in result && result.error) ||
          "Unable to sign in.",
      );
      return;
    }

    // Local 2FA only applies to demo accounts.
    if (!canUseSupabaseAuth()) {
      const twoFactor = getTwoFactorConfig(result.user.email);
      if (twoFactor.enabled && twoFactor.secret) {
        setPendingUser(result.user);
        return;
      }
    }

    await finishLogin(result.user);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <p className="text-sm text-[var(--mentra-muted)]">
          Sign in to your Mentra workspace. Protected by reCAPTCHA v3.
        </p>
      </CardHeader>
      <CardContent>
        {pendingUser ? (
          <TwoFactorChallenge
            email={pendingUser.email}
            onVerified={() => finishLogin(pendingUser)}
            onCancel={() => setPendingUser(null)}
          />
        ) : (
          <>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[var(--mentra-primary)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error ? (
                <p className="rounded-xl bg-[var(--mentra-danger-soft)] px-3 py-2 text-sm text-[var(--mentra-danger)]">
                  {error}
                </p>
              ) : null}
              <Button className="w-full" type="submit" disabled={verifying}>
                {verifying ? "Verifying…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-5 space-y-2">
              <p className="text-center text-xs text-[var(--mentra-muted)]">
                Quick demo access
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    enterDemoAsTutor();
                    const tutor = useDemoStore.getState().user;
                    if (tutor && getTwoFactorConfig(tutor.email).enabled) {
                      useDemoStore.setState({ user: null });
                      setEmail(tutor.email);
                      setPendingUser(tutor);
                      toast.message("2FA required for this account");
                      return;
                    }
                    toast.success("Signed in as Amelia (tutor)");
                    router.push("/dashboard");
                  }}
                >
                  Demo tutor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    enterDemoAsStudent();
                    toast.success("Signed in as Daniel (student)");
                    router.push("/student");
                  }}
                >
                  Demo student
                </Button>
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-[var(--mentra-muted)]">
              New here?{" "}
              <Link
                href="/signup"
                className="font-medium text-[var(--mentra-primary)] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      footer={
        <p className="text-center text-xs text-[var(--mentra-muted)]">
          Tutor: amelia@mentra.app · Student: daniel@student.app · Password: demo1234
        </p>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
