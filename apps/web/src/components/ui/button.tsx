import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mentra-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--mentra-primary)] text-white shadow-sm hover:bg-[var(--mentra-primary-dark)]",
        secondary:
          "bg-[var(--mentra-primary-soft)] text-[var(--mentra-primary)] hover:bg-[#e4e0ff]",
        outline:
          "border border-[var(--mentra-border)] bg-white text-[var(--mentra-ink)] hover:bg-[var(--mentra-background)]",
        ghost: "text-[var(--mentra-muted)] hover:bg-[var(--mentra-primary-soft)] hover:text-[var(--mentra-primary)]",
        destructive:
          "bg-[var(--mentra-danger)] text-white hover:bg-[#a83232]",
        soft: "bg-white text-[var(--mentra-ink)] border border-[var(--mentra-border)] shadow-sm hover:border-[#d6d6e4]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
