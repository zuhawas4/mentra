"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Handles the recovery link landing page (Supabase) and offers a demo update path.
 * Requesting a reset starts on /forgot-password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!isSupabaseConfigured());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (!supabase) throw new Error("Supabase unavailable");
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;
        toast.success("Password updated");
        router.push("/login");
        return;
      }

      toast.success("Demo mode: password update simulated.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <p className="text-sm text-[var(--mentra-muted)]">
            {ready
              ? "Choose a new password for your Mentra account."
              : "Open this page from the email reset link, or request a new one."}
          </p>
        </CardHeader>
        <CardContent>
          {ready ? (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {error ? (
                <p className="rounded-xl bg-[var(--mentra-danger-soft)] px-3 py-2 text-sm text-[var(--mentra-danger)]">
                  {error}
                </p>
              ) : null}
              <Button className="w-full" type="submit" disabled={saving}>
                {saving ? "Updating…" : "Update password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--mentra-muted)]">
                No active recovery session found.
              </p>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request reset link</Link>
              </Button>
            </div>
          )}
          <p className="mt-5 text-center text-sm text-[var(--mentra-muted)]">
            <Link
              href="/login"
              className="font-medium text-[var(--mentra-primary)] hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
