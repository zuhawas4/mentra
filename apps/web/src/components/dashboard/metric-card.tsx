import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  hintTone = "success",
  icon,
  iconBg,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  hintTone?: "success" | "amber" | "muted";
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
}) {
  const hintClass =
    hintTone === "success"
      ? "text-[var(--mentra-success)]"
      : hintTone === "amber"
        ? "text-[var(--mentra-amber)]"
        : "text-[var(--mentra-muted)]";

  const body = (
    <CardContent className="flex items-start justify-between p-5">
      <div>
        <p className="text-sm text-[var(--mentra-muted)]">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--mentra-ink)]">
          {value}
        </p>
        <p className={cn("mt-2 text-xs font-medium", hintClass)}>{hint}</p>
      </div>
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl",
          iconBg,
        )}
      >
        {icon}
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:-translate-y-0.5">
        <Card className="h-full hover:border-[var(--mentra-primary)]/40">
          {body}
        </Card>
      </Link>
    );
  }

  return <Card>{body}</Card>;
}
