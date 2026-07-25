"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MentraLogo } from "@mentra/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState("CALC32");

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
            <CardTitle className="text-xl">Join a session</CardTitle>
            <p className="text-sm text-[var(--mentra-muted)]">
              Enter the code from your tutor to open the waiting room.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/join/${encodeURIComponent(code.trim())}`);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="code">Session code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CALC32"
                  required
                />
              </div>
              <Button className="w-full" type="submit">
                Continue
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-[var(--mentra-muted)]">
              Demo tip: try <span className="font-mono">CALC32</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
