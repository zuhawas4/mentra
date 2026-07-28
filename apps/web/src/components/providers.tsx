"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { RealtimeBridge } from "@/components/realtime/realtime-bridge";
import { demoSeedTasks, hydrateTasks } from "@/lib/redux/tasks-slice";
import { makeStore, type AppStore } from "@/lib/redux/store";
import { useDemoStore } from "@/lib/store/demo-store";

const TASKS_KEY = "mentra-redux-tasks";

function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current!;
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      if (raw) {
        store.dispatch(hydrateTasks(JSON.parse(raw)));
      } else {
        store.dispatch(hydrateTasks(demoSeedTasks));
      }
    } catch {
      store.dispatch(hydrateTasks(demoSeedTasks));
    }

    return store.subscribe(() => {
      const tasks = Object.values(store.getState().tasks.entities).filter(
        Boolean,
      );
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    });
  }, []);

  return (
    <Provider store={storeRef.current}>
      <RealtimeBridge />
      {children}
    </Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mark = () => useDemoStore.setState({ hydrated: true });
    const unsub = useDemoStore.persist.onFinishHydration(mark);
    if (useDemoStore.persist.hasHydrated()) mark();
    // Safety: never leave AuthGate on an infinite skeleton (blocked storage, etc.)
    const fallback = window.setTimeout(mark, 1200);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <ReduxProvider>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: "font-[Manrope,system-ui,sans-serif]",
        }}
      />
    </ReduxProvider>
  );
}
