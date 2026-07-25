"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecaptchaAction } from "@/lib/hooks/use-recaptcha-action";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ForgotPasswordPage() {
  const { runWithRecaptcha, verifying } = useRecaptchaAction("forgot_password");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const outcome = await runWithRecaptcha(async () => {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase) {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.trim().toLowerCase(),
            {
              redirectTo: `${window.location.origin}/reset-password`,
            },
          );
          if (resetError) throw new Error(resetError.message);
          return;
        }
      }
      // Demo mode: same UX, no email sent
      await new Promise((r) => setTimeout(r, 400));
    });

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }

    setSent(true);
    toast.success(
      isSupabaseConfigured()
        ? "Check your email for a reset link."
        : "If an account exists, a reset link would be sent.",
    );
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Forgot password</CardTitle>
          <p className="text-sm text-[var(--mentra-muted)]">
            Enter your email and we&apos;ll send a secure reset link. Protected by
            reCAPTCHA v3.
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--mentra-success-soft)] px-4 py-3 text-sm text-[var(--mentra-success)]">
                If an account exists for <strong>{email}</strong>, you&apos;ll
                receive reset instructions shortly.
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error ? (
                <p className="rounded-xl bg-[var(--mentra-danger-soft)] px-3 py-2 text-sm text-[var(--mentra-danger)]">
                  {error}
                </p>
              ) : null}
              <Button className="w-full" type="submit" disabled={verifying}>
                {verifying ? "Verifying…" : "Send reset link"}
              </Button>
            </form>
          )}
          <p className="mt-5 text-center text-sm text-[var(--mentra-muted)]">
            Remembered it?{" "}
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
