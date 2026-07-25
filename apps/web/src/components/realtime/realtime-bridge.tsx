"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {
  pushNotification,
  setRealtimeStatus,
} from "@/lib/redux/notifications-slice";
import { useAppDispatch } from "@/lib/redux/store";
import {
  startRealtimeTransport,
  subscribeLiveEvents,
} from "@/lib/realtime/live-bus";
import { useDemoStore } from "@/lib/store/demo-store";

/**
 * Bridges the live event bus into Redux notifications.
 * Mount once under the Redux provider.
 */
export function RealtimeBridge() {
  const dispatch = useAppDispatch();
  const prefs = useDemoStore((s) => s.notificationPrefs);
  const user = useDemoStore((s) => s.user);

  useEffect(() => {
    const stopTransport = startRealtimeTransport((connected, transport) => {
      dispatch(setRealtimeStatus({ connected, transport }));
    });

    const unsub = subscribeLiveEvents((event) => {
      if (!user) return;
      if (event.kind === "student_joined" && !prefs.studentJoined) return;
      if (event.kind === "session_live" && !prefs.sessionReminders) return;

      dispatch(
        pushNotification({
          kind: event.kind,
          title: event.title,
          body: event.body,
          href: event.href,
        }),
      );

      if (document.visibilityState === "visible" && event.kind !== "chat") {
        toast.message(event.title, { description: event.body });
      }
    });

    return () => {
      unsub();
      stopTransport();
    };
  }, [dispatch, prefs.sessionReminders, prefs.studentJoined, user]);

  return null;
}
