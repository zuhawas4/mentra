"use client";

import type { PaymentInvoice, Student, StudySession } from "@mentra/shared";

/** Best-effort dual-write to Prisma API when Supabase+DB are configured. */
export async function remoteCreateStudent(
  input: Omit<Student, "id" | "tutorId" | "createdAt">,
) {
  const res = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { student: Student };
  return json.student;
}

export async function remoteUpdateStudent(id: string, patch: Partial<Student>) {
  const res = await fetch(`/api/students/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.ok;
}

export async function remoteDeleteStudent(id: string) {
  const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function remoteCreateSession(input: {
  title: string;
  topic?: string;
  studentId?: string;
  scheduledAt: string;
  durationMinutes?: number;
  agenda?: string;
  createGuestLink?: boolean;
}) {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { session: StudySession };
  return json.session;
}

export async function remoteUpdateSession(
  id: string,
  patch: Partial<StudySession>,
) {
  const res = await fetch(`/api/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.ok;
}

export async function remoteCreatePayment(
  input: Omit<PaymentInvoice, "id" | "tutorId" | "createdAt" | "updatedAt">,
) {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { payment: PaymentInvoice };
  return json.payment;
}

export async function remoteUpdatePayment(
  id: string,
  patch: Partial<PaymentInvoice>,
) {
  const res = await fetch(`/api/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.ok;
}

export async function remoteDeletePayment(id: string) {
  const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
  return res.ok;
}
