"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/store/demo-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewSessionDialog({
  trigger,
  defaultStudentId,
}: {
  trigger?: React.ReactNode;
  defaultStudentId?: string;
}) {
  const students = useDemoStore((s) => s.students);
  const addSession = useDemoStore((s) => s.addSession);
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState(defaultStudentId ?? "");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [agenda, setAgenda] = useState("");
  const [guestLink, setGuestLink] = useState(true);

  function reset() {
    setStudentId(defaultStudentId ?? "");
    setTitle("");
    setTopic("");
    setDate("");
    setTime("10:00");
    setDuration("60");
    setAgenda("");
    setGuestLink(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !title || !date || !time) {
      toast.error("Please complete the required fields.");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const session = addSession({
      studentId,
      title,
      topic: topic || title,
      scheduledAt,
      durationMinutes: Number(duration) || 60,
      status: "scheduled",
      agenda: agenda || undefined,
      createGuestLink: guestLink,
    });
    toast.success(`Session created${session.guestJoinCode ? ` · code ${session.guestJoinCode}` : ""}`);
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>+ New session</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New session</DialogTitle>
          <DialogDescription>
            Schedule a lesson and optionally create a guest join link.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger aria-label="Select student">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Topic / title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Calculus — Integration by parts"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Subject focus</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Optional shorter topic label"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda / initial note</Label>
            <Textarea
              id="agenda"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="What will you cover?"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--mentra-ink)]">
            <input
              type="checkbox"
              checked={guestLink}
              onChange={(e) => setGuestLink(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--mentra-border)] accent-[var(--mentra-primary)]"
            />
            Create shareable guest link / code
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
