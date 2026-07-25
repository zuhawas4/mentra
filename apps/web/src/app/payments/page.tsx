"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";
import type { PaymentStatus } from "@mentra/shared";
import { TutorShell } from "@/components/layout/tutor-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/skeleton";
import { useDemoStore } from "@/lib/store/demo-store";
import { formatShortDate, cn } from "@/lib/utils";

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

const statusTone: Record<PaymentStatus, string> = {
  draft: "bg-[#F1F1F6] text-[var(--mentra-muted)]",
  sent: "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]",
  paid: "bg-[var(--mentra-success-soft)] text-[var(--mentra-success)]",
  overdue: "bg-[#FDECEC] text-[#C53434]",
  cancelled: "bg-[#F1F1F6] text-[var(--mentra-muted)]",
};

function PaymentsContent() {
  const params = useSearchParams();
  const students = useDemoStore((s) => s.students);
  const payments = useDemoStore((s) => s.payments);
  const addPayment = useDemoStore((s) => s.addPayment);
  const updatePayment = useDemoStore((s) => s.updatePayment);

  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [title, setTitle] = useState("Tutoring invoice");
  const [amount, setAmount] = useState("80");
  const [status, setStatus] = useState<PaymentStatus>("sent");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const qStudent = params.get("student");
    const qAmount = params.get("amount");
    const qTitle = params.get("title");
    const qNotes = params.get("notes");
    if (qStudent) {
      const match = students.find(
        (s) =>
          s.id === qStudent ||
          s.fullName.toLowerCase() === qStudent.toLowerCase(),
      );
      if (match) setStudentId(match.id);
    }
    if (qAmount) setAmount(qAmount);
    if (qTitle) setTitle(qTitle);
    if (qNotes) setNotes(qNotes);
    const qStatus = params.get("status") as PaymentStatus | null;
    if (qStatus && ["draft", "sent", "paid", "overdue", "cancelled"].includes(qStatus)) {
      setStatus(qStatus);
    }
  }, [params, students]);

  const totals = useMemo(() => {
    const paid = payments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amountCents, 0);
    const open = payments
      .filter((p) => ["sent", "overdue", "draft"].includes(p.status))
      .reduce((s, p) => s + p.amountCents, 0);
    return { paid, open };
  }, [payments]);

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const student = students.find((s) => s.id === studentId);
    const cents = Math.round(Number(amount) * 100);
    if (!student || !Number.isFinite(cents) || cents < 0) {
      toast.error("Enter a valid student and amount");
      return;
    }
    addPayment({
      studentId: student.id,
      studentName: student.fullName,
      title: title.trim() || "Tutoring invoice",
      amountCents: cents,
      currency: "USD",
      status,
      dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      notes: notes.trim() || undefined,
      paidAt: status === "paid" ? new Date().toISOString() : undefined,
    });
    toast.success("Invoice recorded");
    setNotes("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--mentra-ink)]">
          Payments & invoices
        </h1>
        <p className="mt-1 text-sm text-[var(--mentra-muted)]">
          Track tutoring invoices. Mentra records payment status — it does not
          process card charges.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--mentra-muted)]">Collected</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--mentra-ink)]">
              {money(totals.paid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--mentra-muted)]">Outstanding</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--mentra-ink)]">
              {money(totals.open)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              Record payment / invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onCreate}>
              <div className="space-y-1.5">
                <Label>Student</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
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
              <div className="space-y-1.5">
                <Label htmlFor="title">Invoice title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as PaymentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      ["draft", "sent", "paid", "overdue"] as PaymentStatus[]
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                Save invoice
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.length ? (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--mentra-border)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[var(--mentra-ink)]">
                        {p.title}
                      </p>
                      <p className="text-sm text-[var(--mentra-muted)]">
                        {p.studentName} · {formatShortDate(p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--mentra-ink)]">
                        {money(p.amountCents, p.currency)}
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          statusTone[p.status],
                        )}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                  {p.notes ? (
                    <p className="mt-2 text-sm text-[var(--mentra-muted)]">
                      {p.notes}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.status !== "paid" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          updatePayment(p.id, {
                            status: "paid",
                            paidAt: new Date().toISOString(),
                          });
                          toast.success("Marked as paid");
                        }}
                      >
                        Mark paid
                      </Button>
                    ) : null}
                    {p.status === "sent" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updatePayment(p.id, { status: "overdue" });
                          toast.message("Marked overdue");
                        }}
                      >
                        Mark overdue
                      </Button>
                    ) : null}
                    <Badge variant="muted">#{p.id.slice(-6)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-[var(--mentra-muted)]">
                No invoices yet. Record one from the form or Chrome extension.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <TutorShell>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <PaymentsContent />
      </Suspense>
    </TutorShell>
  );
}
