import type { ActivityItem } from "@mentra/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/lib/utils";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mentra-primary)]" />
            <p className="min-w-0 flex-1 text-sm leading-snug text-[var(--mentra-ink)]">
              {item.message}
            </p>
            <span
              className="shrink-0 text-xs tabular-nums text-[var(--mentra-muted)]"
              suppressHydrationWarning
            >
              {formatRelative(item.createdAt)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
