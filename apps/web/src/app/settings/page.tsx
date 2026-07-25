"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TutorShell } from "@/components/layout/tutor-shell";
import { ProfileAvatarEditor } from "@/components/settings/profile-avatar-editor";
import { TwoFactorCard } from "@/components/settings/two-factor-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/lib/store/demo-store";

export default function SettingsPage() {
  const user = useDemoStore((s) => s.user);
  const updateProfile = useDemoStore((s) => s.updateProfile);
  const prefs = useDemoStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useDemoStore((s) => s.setNotificationPrefs);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [subject, setSubject] = useState(user?.primarySubject ?? "Mathematics");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setSubject(user.primarySubject ?? "Mathematics");
    setBio(localStorage.getItem(`mentra-bio-${user.id}`) ?? "");
  }, [user]);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Display name is required.");
      return;
    }
    updateProfile({
      fullName: fullName.trim(),
      primarySubject: subject.trim() || undefined,
    });
    if (user?.id) {
      localStorage.setItem(`mentra-bio-${user.id}`, bio.trim());
    }
    toast.success("Profile saved");
  }

  if (!user) return null;

  return (
    <TutorShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--mentra-muted)]">
            Manage your profile photo, details, notifications, and security.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={saveProfile}>
              <ProfileAvatarEditor
                userId={user.id}
                fullName={fullName || user.fullName}
                avatarUrl={user.avatarUrl}
                onSaved={(url) => updateProfile({ avatarUrl: url })}
              />

              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Primary subject / specialism</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A-Level Mathematics tutor · 8 years experience"
                />
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["sessionReminders", "Session reminders"],
                ["studentJoined", "When a student joins"],
                ["weeklyDigest", "Weekly digest"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-[var(--mentra-border)] px-4 py-3"
              >
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={prefs[key]}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...prefs, [key]: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <TwoFactorCard email={user.email} />

        <Card>
          <CardHeader>
            <CardTitle>Account & security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline">
              <Link href="/forgot-password">Reset password</Link>
            </Button>
            <p className="text-sm text-[var(--mentra-muted)]">
              Password recovery uses the forgot-password flow (reCAPTCHA +
              Supabase email when configured). 2FA above works via TOTP.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan & billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-dashed border-[var(--mentra-border)] bg-[var(--mentra-background)] p-5">
              <p className="font-semibold text-[var(--mentra-ink)]">Coming soon</p>
              <p className="mt-1 text-sm text-[var(--mentra-muted)]">
                Mentra does not include payments in this version.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TutorShell>
  );
}
