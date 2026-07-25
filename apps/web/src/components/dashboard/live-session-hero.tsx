import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StudySession } from "@mentra/shared";
import { NewSessionDialog } from "@/components/sessions/new-session-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatElapsed } from "@/lib/utils";

export function LiveSessionHero({
  session,
  studentLabel,
  showTimer,
}: {
  session?: StudySession;
  studentLabel?: string;
  showTimer: boolean;
}) {
  return (
    <Card className="overflow-hidden border-0 bg-[var(--mentra-primary)] text-white shadow-[0_12px_40px_rgba(81,66,216,0.28)] xl:col-span-2">
      <div className="session-hero-pattern relative p-6 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">Current session</p>
            <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {session?.title ?? "No live session"}
            </h2>
            <p className="mt-2 text-sm text-white/75">
              {session
                ? studentLabel
                : "Start a scheduled session to open the whiteboard."}
            </p>
          </div>
          {session ? (
            <Badge
              variant="live"
              className="w-fit bg-white/15 text-white ring-1 ring-white/20"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7DFFC3] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7DFFC3]" />
              </span>
              LIVE · {showTimer ? formatElapsed(session.startedAt) : "00:00"}
            </Badge>
          ) : null}
        </div>
        <div className="mt-8">
          {session ? (
            <Button
              asChild
              className="bg-white text-[var(--mentra-primary)] hover:bg-[var(--mentra-primary-soft)]"
            >
              <Link href={`/room/${session.id}`}>
                Join whiteboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <NewSessionDialog
              trigger={
                <Button className="bg-white text-[var(--mentra-primary)] hover:bg-[var(--mentra-primary-soft)]">
                  Schedule a session
                </Button>
              }
            />
          )}
        </div>
      </div>
    </Card>
  );
}
