import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)]",
        success: "bg-[var(--mentra-success-soft)] text-[var(--mentra-success)]",
        amber: "bg-[var(--mentra-amber-soft)] text-[var(--mentra-amber)]",
        muted: "bg-[#F1F1F6] text-[var(--mentra-muted)]",
        danger: "bg-[var(--mentra-danger-soft)] text-[var(--mentra-danger)]",
        live: "bg-[var(--mentra-success-soft)] text-[var(--mentra-success)] gap-1.5",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
