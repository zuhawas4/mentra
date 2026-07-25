"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MentraLogo } from "@mentra/brand";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, formatTime } from "@/lib/utils";

export default function JoinSessionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const findSessionByCode = useDemoStore((s) => s.findSessionByCode);
  const students = useDemoStore((s) => s.students);
  const user = useDemoStore((s) => s.user);
  const [name, setName] = useState(user?.fullName ?? "");

  const session = useMemo(
    () => findSessionByCode(decodeURIComponent(code)),
    [code, findSessionByCode],
  );
  const student = students.find((s) => s.id === session?.studentId);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <MentraLogo className="justify-center" />
            <h1 className="text-xl font-semibold text-[var(--mentra-ink)]">
              Session not found
            </h1>
            <p className="text-sm text-[var(--mentra-muted)]">
              This link or code is invalid or the session may have expired.
            </p>
            <Button asChild variant="outline">
              <Link href="/join">Try another code</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const waiting = session.status === "scheduled";
  const cancelled = session.status === "cancelled";

  function join() {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (cancelled) {
      toast.error("This session was cancelled.");
      return;
    }
    if (waiting) {
      toast.message("Waiting for your tutor to start the session…");
    }
    useDemoStore.setState({
      user: {
        id: user?.id ?? `guest-${Date.now()}`,
        fullName: name.trim(),
        email: user?.email ?? "",
        role: "student",
        createdAt: user?.createdAt ?? new Date().toISOString(),
      },
    });
    router.push(`/room/${session!.id}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <MentraLogo />
          </Link>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">Join session</CardTitle>
              <StatusBadge status={session.status} />
            </div>
            <p className="text-sm text-[var(--mentra-muted)]">
              You&apos;re joining as a guest or student — no full account required.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-[var(--mentra-background)] p-4 text-sm">
              <p className="font-semibold text-[var(--mentra-ink)]">{session.title}</p>
              <p className="mt-1 text-[var(--mentra-muted)]">
                Tutor · Amelia Rose
              </p>
              {student ? (
                <p className="text-[var(--mentra-muted)]">
                  Student · {student.fullName}
                </p>
              ) : null}
              <p className="mt-2 text-[var(--mentra-muted)]">
                {formatShortDate(session.scheduledAt)} · {formatTime(session.scheduledAt)}
              </p>
              <p className="mt-1 font-mono text-xs text-[var(--mentra-primary)]">
                Code {session.guestJoinCode}
              </p>
            </div>

            {waiting ? (
              <div className="rounded-xl bg-[var(--mentra-amber-soft)] px-3 py-2 text-sm text-[var(--mentra-amber)]">
                Waiting room — your tutor hasn&apos;t started yet. You can still join
                and wait on the board.
              </div>
            ) : null}
            {cancelled ? (
              <div className="rounded-xl bg-[var(--mentra-danger-soft)] px-3 py-2 text-sm text-[var(--mentra-danger)]">
                This session was cancelled.
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <Button className="w-full" onClick={join} disabled={cancelled}>
              Join whiteboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
