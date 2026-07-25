"use client";

import { useCallback } from "react";
import type { SessionStatus } from "@mentra/shared";
import { publishLiveEvent } from "@/lib/realtime/live-bus";
import { useDemoStore } from "@/lib/store/demo-store";

export function useSessionActions() {
  const setSessionStatus = useDemoStore((s) => s.setSessionStatus);
  const sessions = useDemoStore((s) => s.sessions);

  const updateStatus = useCallback(
    (id: string, status: SessionStatus) => {
      const session = sessions.find((s) => s.id === id);
      setSessionStatus(id, status);
      if (!session || session.status === status) return;

      if (status === "live") {
        publishLiveEvent({
          kind: "session_live",
          title: "Session is live",
          body: `${session.title} just started`,
          href: `/room/${id}`,
          sessionId: id,
        });
      } else if (status === "completed") {
        publishLiveEvent({
          kind: "session_ended",
          title: "Session ended",
          body: `${session.title} was marked complete`,
          href: `/sessions/${id}`,
          sessionId: id,
        });
      }
    },
    [sessions, setSessionStatus],
  );

  return { updateStatus };
}
