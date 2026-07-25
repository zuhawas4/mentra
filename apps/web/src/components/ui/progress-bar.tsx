import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-[#EEEFF5]",
        trackClassName,
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[var(--mentra-primary)] transition-all duration-500",
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
