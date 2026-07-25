"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { BoardStroke, SessionParticipant } from "@mentra/shared";
import { AuthGate } from "@/components/auth-gate";
import { SessionChat } from "@/components/room/session-chat";
import { StatusBadge } from "@/components/status-badge";
import { WhiteboardCanvas } from "@/components/whiteboard/whiteboard-canvas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionActions } from "@/lib/hooks/use-session-actions";
import { publishLiveEvent } from "@/lib/realtime/live-bus";
import { useDemoStore } from "@/lib/store/demo-store";
import { subscribeBoard } from "@/lib/realtime/board-sync";
import { formatElapsed, formatShortDate, formatTime, cn } from "@/lib/utils";

const EMPTY_STROKES: BoardStroke[] = [];

export default function SessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const user = useDemoStore((s) => s.user);
  const session = useDemoStore((s) => s.sessions.find((x) => x.id === id));
  const student = useDemoStore((s) =>
    s.students.find((st) => st.id === session?.studentId),
  );
  const strokes =
    useDemoStore((s) => s.boards[id]) ?? EMPTY_STROKES;
  const setBoard = useDemoStore((s) => s.setBoard);
  const setSessionStatus = useDemoStore((s) => s.setSessionStatus);
  const { updateStatus } = useSessionActions();
  const upsertNote = useDemoStore((s) => s.upsertNote);
  const getNoteForSession = useDemoStore((s) => s.getNoteForSession);

  const [panelOpen, setPanelOpen] = useState(true);
  const [note, setNote] = useState("");
  const [tick, setTick] = useState(0);
  const [syncMode, setSyncMode] = useState<"demo" | "supabase">("demo");
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const joinedAnnounced = useRef(false);
  const boardChannelRef = useRef<ReturnType<typeof subscribeBoard> | null>(
    null,
  );

  const isTutor = user?.role === "tutor";

  useEffect(() => {
    const existing = getNoteForSession(id);
    if (existing) setNote(existing.content);
  }, [id, getNoteForSession]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session || !user) return;
    if (session.status === "scheduled" && isTutor) {
      updateStatus(session.id, "live");
    }
    if (!isTutor && !joinedAnnounced.current) {
      joinedAnnounced.current = true;
      publishLiveEvent({
        kind: "student_joined",
        title: "Student joined",
        body: `${user.fullName} joined the whiteboard`,
        href: `/room/${session.id}`,
        sessionId: session.id,
        authorId: user.id,
      });
    }

    const localParticipants: SessionParticipant[] = [
      {
        id: "tutor-amelia",
        name: "Amelia Rose",
        role: "tutor",
        online: true,
        color: "#5142D8",
      },
      {
        id: student?.id ?? "student",
        name: student?.fullName ?? "Student",
        role: "student",
        online: session.status === "live",
        color: "#18775A",
      },
    ];
    if (user.role === "student" || user.id.startsWith("guest")) {
      localParticipants[1] = {
        id: user.id,
        name: user.fullName,
        role: user.role === "student" ? "student" : "guest",
        online: true,
        color: "#18775A",
      };
    }
    setParticipants(localParticipants);

    const channel = subscribeBoard(
      session.id,
      (remote) => setBoard(session.id, remote),
      (status) => setSessionStatus(session.id, status),
      (people) => {
        if (!people.length) return;
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            online: people.some((x) => x.id === p.id || x.name === p.name),
          })),
        );
      },
    );
    setSyncMode(channel.mode);
    boardChannelRef.current = channel;
    channel.trackPresence({ id: user.id, name: user.fullName });

    // Hydrate strokes from Prisma when available.
    void fetch(`/api/sessions/${session.id}/strokes`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { strokes?: BoardStroke[] } | null) => {
        if (json?.strokes?.length) setBoard(session.id, json.strokes);
      })
      .catch(() => undefined);

    return () => {
      boardChannelRef.current = null;
      channel.unsubscribe();
    };
  }, [
    session,
    user,
    isTutor,
    student,
    setBoard,
    setSessionStatus,
    updateStatus,
  ]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !session?.guestJoinCode) return "";
    return `${window.location.origin}/join/${session.guestJoinCode}`;
  }, [session?.guestJoinCode]);

  void tick;

  if (!session) {
    return (
      <AuthGate>
        <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] p-6">
          <div className="rounded-2xl border border-[var(--mentra-border)] bg-white p-8 text-center">
            <p className="text-[var(--mentra-muted)]">Session not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </AuthGate>
    );
  }

  function handleBoardChange(next: BoardStroke[]) {
    setBoard(id, next);
    boardChannelRef.current?.publishBoard(next);
    const newest = next[next.length - 1];
    const prevLen = strokes.length;
    if (newest && next.length > prevLen) {
      void fetch(`/api/sessions/${id}/strokes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: newest.points,
          color: newest.color,
          width: newest.width,
          tool: newest.tool,
        }),
      }).catch(() => undefined);
    }
  }

  return (
    <AuthGate>
      <div className="flex h-[100dvh] flex-col bg-[var(--mentra-background)]">
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--mentra-border)] bg-white px-3 py-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() =>
              router.push(isTutor ? "/sessions" : "/student")
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-[var(--mentra-ink)] sm:text-base">
                {session.title}
              </h1>
              <StatusBadge status={session.status} showPulse={session.status === "live"} />
              <Badge variant="muted" className="hidden sm:inline-flex">
                {syncMode === "supabase" ? "Realtime sync" : "Demo sync"}
              </Badge>
            </div>
            <p className="truncate text-xs text-[var(--mentra-muted)]">
              {student?.fullName ?? "Guest session"}
              {session.status === "live"
                ? ` · ${formatElapsed(session.startedAt)}`
                : ""}
            </p>
          </div>

          <div className="flex items-center -space-x-2">
            {participants.map((p) => (
              <div key={p.id} className="relative" title={p.name}>
                <Avatar className="h-8 w-8 ring-2 ring-white">
                  <AvatarFallback
                    name={p.name}
                    className="text-[10px]"
                    style={{ backgroundColor: `${p.color}22`, color: p.color }}
                  />
                </Avatar>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                    p.online ? "bg-[var(--mentra-success)]" : "bg-[#C5C5D2]",
                  )}
                />
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!shareUrl) {
                toast.error("No guest code for this session.");
                return;
              }
              navigator.clipboard.writeText(shareUrl);
              toast.success("Share link copied");
            }}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {isTutor ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                updateStatus(session.id, "completed");
                toast.success("Session ended");
                router.push(`/sessions/${session.id}`);
              }}
            >
              End session
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            aria-label={panelOpen ? "Hide panel" : "Show panel"}
            onClick={() => setPanelOpen((v) => !v)}
            className="hidden md:inline-flex"
          >
            {panelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 p-3 sm:p-4">
            <WhiteboardCanvas
              strokes={strokes}
              onChange={handleBoardChange}
              authorId={user?.id ?? "anonymous"}
              readOnly={session.status === "completed"}
            />
          </div>

          <aside
            className={cn(
              "border-l border-[var(--mentra-border)] bg-white transition-all",
              panelOpen
                ? "w-full max-w-full fixed inset-x-0 bottom-0 z-40 max-h-[55vh] overflow-auto rounded-t-3xl border-t shadow-2xl md:static md:z-0 md:max-h-none md:w-[320px] md:rounded-none md:border-t-0 md:shadow-none"
                : "hidden md:hidden",
            )}
          >
            <div className="flex items-center justify-between border-b border-[var(--mentra-border)] px-4 py-3 md:hidden">
              <p className="text-sm font-semibold">Session panel</p>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="text-sm text-[var(--mentra-muted)]"
              >
                Close
              </button>
            </div>
            <div className="space-y-5 p-4">
              <section>
                <h2 className="text-sm font-semibold text-[var(--mentra-ink)]">
                  Session notes
                </h2>
                <Textarea
                  className="mt-2"
                  rows={5}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Capture key points from this lesson…"
                  readOnly={!isTutor && session.status === "completed"}
                />
                {isTutor ? (
                  <Button
                    className="mt-2 w-full"
                    variant="secondary"
                    onClick={() => {
                      upsertNote(session.id, note, user?.id ?? "tutor");
                      toast.success("Notes saved");
                    }}
                  >
                    Save notes
                  </Button>
                ) : null}
              </section>

              <SessionChat
                sessionId={session.id}
                authorId={user?.id ?? "anonymous"}
                authorName={user?.fullName ?? "Guest"}
              />

              <section>
                <h2 className="text-sm font-semibold text-[var(--mentra-ink)]">
                  Participants
                </h2>
                <div className="mt-2 space-y-2">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--mentra-border)] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            p.online
                              ? "bg-[var(--mentra-success)]"
                              : "bg-[#C5C5D2]",
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs capitalize text-[var(--mentra-muted)]">
                            {p.role}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--mentra-muted)]">
                        {p.online
                          ? p.role === "tutor"
                            ? "Tutor online"
                            : "Student joined"
                          : "Away"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-[var(--mentra-ink)]">
                  Session details
                </h2>
                <dl className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--mentra-muted)]">When</dt>
                    <dd className="text-right">
                      {formatShortDate(session.scheduledAt)} ·{" "}
                      {formatTime(session.scheduledAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--mentra-muted)]">Duration</dt>
                    <dd>{session.durationMinutes ?? 60} min</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--mentra-muted)]">Code</dt>
                    <dd className="font-mono">{session.guestJoinCode ?? "—"}</dd>
                  </div>
                </dl>
                {session.guestJoinCode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Copied join link");
                    }}
                  >
                    <Copy className="h-4 w-4" /> Copy guest link
                  </Button>
                ) : null}
                {isTutor && student ? (
                  <Button asChild variant="ghost" className="mt-2 w-full justify-between">
                    <Link href={`/students/${student.id}`}>
                      View student profile <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </section>
            </div>
          </aside>
        </div>

        {!panelOpen ? (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="fixed bottom-4 right-4 z-30 rounded-full bg-[var(--mentra-primary)] px-4 py-2 text-sm font-medium text-white shadow-lg md:hidden"
          >
            Notes & people
          </button>
        ) : null}
      </div>
    </AuthGate>
  );
}
