"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import {
  clearTwoFactorConfig,
  getTwoFactorConfig,
  setTwoFactorConfig,
} from "@/lib/auth/two-factor";
import {
  generateBackupCodes,
  generateTotpSecret,
  verifyTotpCode,
} from "@/lib/auth/totp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function TwoFactorCard({ email }: { email: string }) {
  const [enabled, setEnabled] = useState(false);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupUri, setSetupUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  useEffect(() => {
    const config = getTwoFactorConfig(email);
    setEnabled(config.enabled);
  }, [email]);

  function beginEnable() {
    const { secret, uri } = generateTotpSecret(email);
    const codes = generateBackupCodes();
    setSetupSecret(secret);
    setSetupUri(uri);
    setBackupCodes(codes);
    setCode("");
  }

  function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!setupSecret) return;
    if (!verifyTotpCode(setupSecret, code)) {
      toast.error("Invalid authenticator code. Try again.");
      return;
    }
    setTwoFactorConfig(email, {
      enabled: true,
      secret: setupSecret,
      backupCodes,
      enabledAt: new Date().toISOString(),
    });
    setEnabled(true);
    setSetupSecret(null);
    setSetupUri(null);
    toast.success("Two-factor authentication enabled");
  }

  function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    const config = getTwoFactorConfig(email);
    if (!config.secret || !verifyTotpCode(config.secret, disableCode)) {
      toast.error("Enter a valid authenticator code to disable 2FA.");
      return;
    }
    clearTwoFactorConfig(email);
    setEnabled(false);
    setDisableCode("");
    setBackupCodes([]);
    toast.success("Two-factor authentication disabled");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <ShieldCheck className="h-5 w-5 text-[var(--mentra-success)]" />
          ) : (
            <ShieldOff className="h-5 w-5 text-[var(--mentra-muted)]" />
          )}
          Two-factor authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-[var(--mentra-border)] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[var(--mentra-ink)]">
              Authenticator app (TOTP)
            </p>
            <p className="text-xs text-[var(--mentra-muted)]">
              {enabled
                ? "Required at every login for this account."
                : "Add a second step after password on sign-in."}
            </p>
          </div>
          <Switch
            checked={enabled || Boolean(setupSecret)}
            onCheckedChange={(checked) => {
              if (checked) beginEnable();
              else if (enabled) {
                /* require code form below */
              } else {
                setSetupSecret(null);
                setSetupUri(null);
              }
            }}
            aria-label="Toggle two-factor authentication"
          />
        </div>

        {setupSecret && setupUri ? (
          <form className="space-y-3 rounded-2xl bg-[var(--mentra-background)] p-4" onSubmit={confirmEnable}>
            <p className="text-sm text-[var(--mentra-ink)]">
              Add this secret in Google Authenticator, Authy, or 1Password, then
              enter the 6-digit code.
            </p>
            <div className="rounded-xl border border-[var(--mentra-border)] bg-white p-3">
              <p className="text-xs text-[var(--mentra-muted)]">Secret key</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold">
                {setupSecret}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--mentra-border)] bg-white p-3">
              <p className="text-xs text-[var(--mentra-muted)]">Backup codes</p>
              <ul className="mt-1 grid grid-cols-2 gap-1 font-mono text-xs">
                {backupCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enable-2fa-code">Confirmation code</Label>
              <Input
                id="enable-2fa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Enable 2FA</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSetupSecret(null);
                  setSetupUri(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {enabled && !setupSecret ? (
          <form className="space-y-3" onSubmit={confirmDisable}>
            <p className="text-sm text-[var(--mentra-muted)]">
              To disable 2FA, enter a current authenticator code.
            </p>
            <div className="space-y-2">
              <Label htmlFor="disable-2fa-code">Authenticator code</Label>
              <Input
                id="disable-2fa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="destructive">
              Disable 2FA
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
