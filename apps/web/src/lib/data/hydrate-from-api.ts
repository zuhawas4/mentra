"use client";

import type { PaymentInvoice, Student, StudySession } from "@mentra/shared";
import { useDemoStore } from "@/lib/store/demo-store";

/**
 * When Supabase + Prisma APIs are available, replace demo collections
 * with server data. Leaves UI components unchanged.
 */
export async function hydrateFromApi() {
  try {
    const [studentsRes, sessionsRes, paymentsRes] = await Promise.all([
      fetch("/api/students"),
      fetch("/api/sessions"),
      fetch("/api/payments"),
    ]);

    if (!studentsRes.ok || !sessionsRes.ok) return false;

    const studentsJson = (await studentsRes.json()) as { students: Student[] };
    const sessionsJson = (await sessionsRes.json()) as {
      sessions: StudySession[];
    };
    const patch: {
      students: Student[];
      sessions: StudySession[];
      payments?: PaymentInvoice[];
    } = {
      students: studentsJson.students,
      sessions: sessionsJson.sessions,
    };

    if (paymentsRes.ok) {
      const paymentsJson = (await paymentsRes.json()) as {
        payments: PaymentInvoice[];
      };
      patch.payments = paymentsJson.payments;
    }

    useDemoStore.setState(patch);
    return true;
  } catch {
    return false;
  }
}
