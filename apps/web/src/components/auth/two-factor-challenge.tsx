"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { consumeBackupCode, getTwoFactorConfig } from "@/lib/auth/two-factor";
import { verifyTotpCode } from "@/lib/auth/totp";

export function TwoFactorChallenge({
  email,
  onVerified,
  onCancel,
}: {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [useBackup, setUseBackup] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const config = getTwoFactorConfig(email);
    if (!config.enabled || !config.secret) {
      onVerified();
      return;
    }

    const ok = useBackup
      ? consumeBackupCode(email, code)
      : verifyTotpCode(config.secret, code);

    if (!ok) {
      setError(
        useBackup
          ? "Invalid or already-used backup code."
          : "Invalid authenticator code.",
      );
      return;
    }
    onVerified();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <h3 className="text-lg font-semibold text-[var(--mentra-ink)]">
          Two-factor confirmation
        </h3>
        <p className="mt-1 text-sm text-[var(--mentra-muted)]">
          {useBackup
            ? "Enter one of your Mentra backup codes."
            : "Open your authenticator app and enter the 6-digit code."}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="totp">{useBackup ? "Backup code" : "Authentication code"}</Label>
        <Input
          id="totp"
          autoFocus
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={useBackup ? "ABC-DEF" : "123456"}
          required
        />
      </div>
      {error ? (
        <p className="rounded-xl bg-[var(--mentra-danger-soft)] px-3 py-2 text-sm text-[var(--mentra-danger)]">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit">
        Verify and continue
      </Button>
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          className="font-medium text-[var(--mentra-primary)] hover:underline"
          onClick={() => {
            setUseBackup((v) => !v);
            setError("");
            setCode("");
          }}
        >
          {useBackup ? "Use authenticator code" : "Use a backup code"}
        </button>
        <button
          type="button"
          className="text-[var(--mentra-muted)] hover:underline"
          onClick={onCancel}
        >
          Back
        </button>
      </div>
    </form>
  );
}
