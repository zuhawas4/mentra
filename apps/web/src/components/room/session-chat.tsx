"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publishLiveEvent, subscribeLiveEvents } from "@/lib/realtime/live-bus";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export function SessionChat({
  sessionId,
  authorId,
  authorName,
}: {
  sessionId: string;
  authorId: string;
  authorName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/sessions/${sessionId}/messages`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { messages?: ChatMessage[] } | null) => {
        if (cancelled || !json?.messages?.length) return;
        setMessages(json.messages);
      })
      .catch(() => {
        /* demo mode / API unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    return subscribeLiveEvents((event) => {
      if (event.kind !== "chat" || event.sessionId !== sessionId) return;
      if (!event.body || !event.authorId) return;
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.authorId === event.authorId &&
              m.body === event.body &&
              Date.now() - new Date(m.createdAt).getTime() < 2000,
          )
        ) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            authorId: event.authorId!,
            authorName: event.title.replace(/^Chat · /, "") || "Participant",
            body: event.body,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    });
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    publishLiveEvent({
      kind: "chat",
      title: `Chat · ${authorName}`,
      body,
      href: `/room/${sessionId}`,
      sessionId,
      authorId,
    });
    // Persist via Prisma API when Supabase+DB are configured.
    void fetch(`/api/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }).catch(() => undefined);
  }

  return (
    <section className="flex min-h-[220px] flex-col">
      <h2 className="text-sm font-semibold text-[var(--mentra-ink)]">
        Live chat
      </h2>
      <div className="mt-2 flex-1 space-y-2 overflow-auto rounded-xl border border-[var(--mentra-border)] bg-[var(--mentra-background)] p-3">
        {messages.length ? (
          messages.map((msg) => {
            const mine = msg.authorId === authorId;
            return (
              <div
                key={msg.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    mine
                      ? "bg-[var(--mentra-primary)] text-white"
                      : "bg-white text-[var(--mentra-ink)] border border-[var(--mentra-border)]",
                  )}
                >
                  {!mine ? (
                    <p className="mb-0.5 text-[11px] font-medium opacity-70">
                      {msg.authorName}
                    </p>
                  ) : null}
                  <p>{msg.body}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-6 text-center text-xs text-[var(--mentra-muted)]">
            Say hello — messages sync live across open Mentra tabs.
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <form className="mt-2 flex gap-2" onSubmit={send}>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          aria-label="Chat message"
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
