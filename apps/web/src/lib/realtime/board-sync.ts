"use client";

import type { BoardStroke, SessionStatus } from "@mentra/shared";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type BoardHandler = (strokes: BoardStroke[]) => void;
type StatusHandler = (status: SessionStatus) => void;
type PresenceHandler = (people: Array<{ id: string; name: string; online: boolean }>) => void;

/**
 * Subscribe to collaborative board updates.
 * Falls back to a no-op local channel when Supabase is not configured.
 */
export function subscribeBoard(
  sessionId: string,
  onBoard: BoardHandler,
  onStatus?: StatusHandler,
  onPresence?: PresenceHandler,
) {
  if (!isSupabaseConfigured()) {
    return {
      publishBoard: (_strokes: BoardStroke[]) => {
        /* demo mode: local store is source of truth */
      },
      publishStatus: (_status: SessionStatus) => {},
      trackPresence: (_person: { id: string; name: string }) => {},
      unsubscribe: () => {},
      mode: "demo" as const,
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      publishBoard: () => {},
      publishStatus: () => {},
      trackPresence: () => {},
      unsubscribe: () => {},
      mode: "demo" as const,
    };
  }

  const channel = supabase.channel(`session:${sessionId}`, {
    config: { presence: { key: sessionId } },
  });

  channel
    .on("broadcast", { event: "board" }, ({ payload }) => {
      if (payload?.strokes) onBoard(payload.strokes as BoardStroke[]);
    })
    .on("broadcast", { event: "status" }, ({ payload }) => {
      if (payload?.status && onStatus) onStatus(payload.status as SessionStatus);
    })
    .on("presence", { event: "sync" }, () => {
      if (!onPresence) return;
      const state = channel.presenceState<{ id: string; name: string }>();
      const people = Object.values(state)
        .flat()
        .map((p) => ({ id: p.id, name: p.name, online: true }));
      onPresence(people);
    })
    .subscribe();

  return {
    publishBoard: (strokes: BoardStroke[]) => {
      void channel.send({
        type: "broadcast",
        event: "board",
        payload: { strokes },
      });
    },
    publishStatus: (status: SessionStatus) => {
      void channel.send({
        type: "broadcast",
        event: "status",
        payload: { status },
      });
    },
    trackPresence: (person: { id: string; name: string }) => {
      void channel.track(person);
    },
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
    mode: "supabase" as const,
  };
}
