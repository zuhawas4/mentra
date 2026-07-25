"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LiveNotificationKind } from "@/lib/redux/notifications-slice";

export type LiveEvent = {
  kind: LiveNotificationKind;
  title: string;
  body: string;
  href?: string;
  sessionId?: string;
  authorId?: string;
};

type Listener = (event: LiveEvent) => void;

const CHANNEL = "mentra-live";
const listeners = new Set<Listener>();
let broadcast: BroadcastChannel | null = null;
let supabaseUnsub: (() => void) | null = null;
let demoTimer: ReturnType<typeof setInterval> | null = null;

function ensureBroadcast() {
  if (typeof window === "undefined") return null;
  if (!broadcast) {
    broadcast = new BroadcastChannel(CHANNEL);
    broadcast.onmessage = (msg) => {
      const event = msg.data as LiveEvent;
      listeners.forEach((l) => l(event));
    };
  }
  return broadcast;
}

export function publishLiveEvent(event: LiveEvent) {
  ensureBroadcast()?.postMessage(event);
  listeners.forEach((l) => l(event));

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    void supabase?.channel("mentra-live").send({
      type: "broadcast",
      event: "live",
      payload: event,
    });
  }
}

export function subscribeLiveEvents(listener: Listener) {
  listeners.add(listener);
  ensureBroadcast();
  return () => {
    listeners.delete(listener);
  };
}

/** Start realtime transport: Supabase when configured, else demo bus + heartbeat */
export function startRealtimeTransport(onStatus: (connected: boolean, transport: "demo-bus" | "supabase" | "offline") => void) {
  if (typeof window === "undefined") {
    onStatus(false, "offline");
    return () => {};
  }

  ensureBroadcast();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const channel = supabase
        .channel("mentra-live")
        .on("broadcast", { event: "live" }, ({ payload }) => {
          const event = payload as LiveEvent;
          listeners.forEach((l) => l(event));
        })
        .subscribe((status) => {
          onStatus(status === "SUBSCRIBED", "supabase");
        });
      supabaseUnsub = () => {
        void supabase.removeChannel(channel);
      };
      return () => {
        supabaseUnsub?.();
        supabaseUnsub = null;
      };
    }
  }

  onStatus(true, "demo-bus");

  // Lightweight demo pulse so realtime cues are visible in recordings
  if (!demoTimer) {
    demoTimer = setInterval(() => {
      /* connection keepalive only — no spam notifications */
    }, 30_000);
  }

  return () => {
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = null;
    }
    onStatus(false, "offline");
  };
}
