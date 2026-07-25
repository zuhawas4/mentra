import type { SessionStatus } from "@mentra/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const labels: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

const variants: Record<
  SessionStatus,
  "muted" | "live" | "success" | "danger" | "default"
> = {
  scheduled: "muted",
  live: "live",
  completed: "success",
  cancelled: "danger",
};

export function StatusBadge({
  status,
  className,
  showPulse,
  label,
}: {
  status: SessionStatus;
  className?: string;
  showPulse?: boolean;
  /** Override display label (e.g. "In progress" for live rows) */
  label?: string;
}) {
  return (
    <Badge variant={variants[status]} className={cn(className)}>
      {status === "live" || showPulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mentra-success)] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--mentra-success)]" />
        </span>
      ) : null}
      {label ?? labels[status]}
    </Badge>
  );
}
