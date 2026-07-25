"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  PenLine,
  Sparkles,
} from "lucide-react";
import { MentraLogo } from "@mentra/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-[var(--mentra-background)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <MentraLogo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/signup">Start teaching</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="hero-orb border-b border-[var(--mentra-border)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            <div className="animate-fade-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--mentra-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--mentra-primary)]">
                <Sparkles className="h-3.5 w-3.5" />
                Built for independent tutors
              </div>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[var(--mentra-ink)] sm:text-5xl">
                Teach together on a calm, shared whiteboard.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--mentra-muted)] sm:text-lg">
                Mentra helps tutors schedule lessons, open a live collaborative
                board, capture notes, and keep every student&apos;s history in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start teaching with Mentra <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/join">Join a session</Link>
                </Button>
              </div>
            </div>

            <div className="animate-fade-up-delay-1">
              <div className="rounded-[28px] border border-[var(--mentra-border)] bg-white p-3 shadow-[var(--mentra-shadow)]">
                <div className="overflow-hidden rounded-[22px] bg-[var(--mentra-primary)] p-5 text-white session-hero-pattern">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-white/70">Live session</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7DFFC3] live-pulse" />
                      LIVE · 32:14
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">
                    Calculus — Integration by parts
                  </h3>
                  <p className="mt-1 text-sm text-white/75">
                    with Daniel Miller · A-Level Mathematics
                  </p>
                  <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <div className="h-28 rounded-xl border border-white/15 bg-white/5">
                      <svg viewBox="0 0 320 120" className="h-full w-full opacity-90">
                        <path
                          d="M20 80 C60 20, 100 100, 140 50 S220 20, 300 70"
                          stroke="#C8C2F5"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M40 90 C90 40, 130 90, 180 55 S250 45, 290 85"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <Button className="mt-4 w-full bg-white text-[var(--mentra-primary)] hover:bg-[var(--mentra-primary-soft)]">
                      Join whiteboard →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--mentra-ink)] sm:text-3xl">
              Everything around the lesson, not just the board.
            </h2>
            <p className="mt-3 text-[var(--mentra-muted)]">
              Mentra keeps sessions, students, notes, and snapshots connected —
              so the whiteboard never becomes a disposable tab.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: PenLine,
                title: "Live shared whiteboards",
                body: "Draw together in realtime with presence cues that make remote tutoring feel present.",
              },
              {
                icon: CalendarCheck2,
                title: "Sessions and student history",
                body: "Schedule lessons, track progress, and reopen past boards without digging through files.",
              },
              {
                icon: BookOpen,
                title: "Notes that stay with each lesson",
                body: "Capture what mattered during the session and find it again next to the student profile.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="animate-fade-up">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--mentra-ink)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--mentra-muted)]">
                    {feature.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--mentra-border)] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--mentra-ink)]">
              How it works
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create a session",
                  body: "Pick a student, set a topic, and generate a guest join code in seconds.",
                },
                {
                  step: "02",
                  title: "Teach together on the board",
                  body: "Open the live room, draw freehand, and keep notes beside the canvas.",
                },
                {
                  step: "03",
                  title: "Keep everything saved",
                  body: "End the session with a snapshot, notes, and history ready for next time.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-[var(--mentra-border)] p-6">
                  <p className="text-sm font-semibold text-[var(--mentra-primary)]">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--mentra-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--mentra-muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="text-sm font-medium text-[var(--mentra-primary)]">
                  Trusted by independent tutors
                </p>
                <blockquote className="mt-3 text-xl font-medium leading-relaxed text-[var(--mentra-ink)] sm:text-2xl">
                  “Mentra finally gave me one calm place for boards, notes, and
                  student history. My lessons feel more intentional.”
                </blockquote>
                <p className="mt-4 text-sm text-[var(--mentra-muted)]">
                  Amelia Rose · Mathematics tutor
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--mentra-primary-soft)] p-6">
                <p className="text-sm font-semibold text-[var(--mentra-primary)]">
                  Demo ready
                </p>
                <p className="mt-2 text-sm text-[var(--mentra-muted)]">
                  Explore the full tutor workspace without configuring Supabase.
                  Sign in with the demo tutor account and open the live whiteboard.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/login">Try the demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-[var(--mentra-border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <MentraLogo />
            <p className="mt-3 max-w-sm text-sm text-[var(--mentra-muted)]">
              Collaborative whiteboards and session history for independent tutors.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--mentra-muted)]">
              <Link href="/login" className="hover:text-[var(--mentra-ink)]">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-[var(--mentra-ink)]">
                Sign up
              </Link>
              <Link href="/join" className="hover:text-[var(--mentra-ink)]">
                Join session
              </Link>
            </div>
          </div>
          <form
            className="w-full max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) router.push(`/join/${encodeURIComponent(code.trim())}`);
            }}
          >
            <p className="mb-2 text-sm font-medium text-[var(--mentra-ink)]">
              Have a session code?
            </p>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CALC32"
                aria-label="Session code"
              />
              <Button type="submit">Join</Button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
