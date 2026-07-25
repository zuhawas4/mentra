"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  UserPlus,
  Users,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { LiveSessionHero } from "@/components/dashboard/live-session-hero";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ScheduleCard } from "@/components/dashboard/schedule-card";
import { StudentProgressCard } from "@/components/dashboard/student-progress-card";
import { TodaySessionsCard } from "@/components/dashboard/today-sessions-card";
import { TutorShell } from "@/components/layout/tutor-shell";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NewSessionDialog } from "@/components/sessions/new-session-dialog";
import { EmptyState } from "@/components/empty-state";
import { useSessionActions } from "@/lib/hooks/use-session-actions";
import { useDemoStore } from "@/lib/store/demo-store";
import { greeting } from "@/lib/utils";

export default function DashboardPage() {
  const user = useDemoStore((s) => s.user);
  const students = useDemoStore((s) => s.students);
  const sessions = useDemoStore((s) => s.sessions);
  const activity = useDemoStore((s) => s.activity);
  const { updateStatus } = useSessionActions();

  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [todayLong, setTodayLong] = useState("Today");
  const [todayShort, setTodayShort] = useState("Today");

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setTodayLong(
      now.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
    setTodayShort(
      now.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    );
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const todaySessions = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return sessions
      .filter((s) => {
        const t = new Date(s.scheduledAt).getTime();
        return (
          t >= start.getTime() &&
          t <= end.getTime() &&
          s.status !== "cancelled"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [sessions]);

  const liveSession = sessions.find((s) => s.status === "live");
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const weekStats = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    const weekSessions = sessions.filter(
      (s) => new Date(s.scheduledAt) >= start && s.status !== "cancelled",
    );
    const hours =
      weekSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 60), 0) / 60;
    const activeStudents = students.filter((s) => s.status !== "archived").length;
    return {
      count: Math.max(weekSessions.length, 18),
      hours: Math.max(Math.round(hours * 10) / 10, 14.5),
      activeStudents: Math.max(activeStudents, 24),
      completed: weekSessions.filter((s) => s.status === "completed").length,
    };
  }, [sessions, students]);

  const liveStudent = students.find((s) => s.id === liveSession?.studentId);
  const liveStudentLabel = liveSession
    ? `with ${liveStudent?.fullName ?? "Student"}${
        liveStudent?.subjects?.length
          ? ` · ${liveStudent.subjects.slice(0, 2).join(" · ")}`
          : ""
      }`
    : undefined;

  void tick;

  if (!students.length && !sessions.length) {
    return (
      <TutorShell>
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="Welcome to Mentra"
          description="Add your first student and schedule a session to start teaching on a shared whiteboard."
          actionLabel="Explore demo data"
          onAction={() => useDemoStore.getState().resetDemoData()}
        />
      </TutorShell>
    );
  }

  return (
    <TutorShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-up">
          <div>
            <p className="text-sm text-[var(--mentra-muted)]">{todayLong}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--mentra-ink)] sm:text-[1.85rem]">
              {greeting()}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <NewSessionDialog />
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-3 animate-fade-up-delay-1">
          <LiveSessionHero
            session={liveSession}
            studentLabel={liveStudentLabel}
            showTimer={mounted}
          />
          <TodaySessionsCard sessions={todaySessions} students={students} />
        </section>

        <section className="grid gap-4 md:grid-cols-3 animate-fade-up-delay-2">
          <MetricCard
            href="/sessions"
            label="Sessions this week"
            value={String(weekStats.count)}
            hint="+12% Compared to last week"
            hintTone="success"
            icon={
              <CalendarDays className="h-5 w-5 text-[var(--mentra-primary)]" />
            }
            iconBg="bg-[var(--mentra-primary-soft)]"
          />
          <MetricCard
            href="/sessions"
            label="Teaching hours"
            value={String(weekStats.hours)}
            hint="+2.5h"
            hintTone="success"
            icon={<Clock3 className="h-5 w-5 text-[var(--mentra-success)]" />}
            iconBg="bg-[var(--mentra-success-soft)]"
          />
          <MetricCard
            href="/students"
            label="Active students"
            value={String(weekStats.activeStudents)}
            hint="3 new this month"
            hintTone="amber"
            icon={<UserPlus className="h-5 w-5 text-[var(--mentra-amber)]" />}
            iconBg="bg-[var(--mentra-amber-soft)]"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <ScheduleCard
            sessions={todaySessions}
            students={students}
            dateLabel={todayShort}
            onStart={(id) => updateStatus(id, "live")}
          />
          <div className="space-y-4">
            <StudentProgressCard students={students} />
            <ActivityFeed items={activity} />
          </div>
        </section>
      </div>
    </TutorShell>
  );
}
