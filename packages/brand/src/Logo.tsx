import type { SVGProps } from "react";

type MentraLogoProps = SVGProps<SVGSVGElement> & {
  withWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
};

/** Mentra mark: continuous S-curve between lavender and indigo nodes */
export function MentraMark({
  size = 28,
  className,
  ...props
}: MentraLogoProps) {
  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 48 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 17C7 10.5 12.2 6.5 18 6.5C24.5 6.5 23.5 27.5 30.5 27.5C36.2 27.5 41 23.2 41 17"
        stroke="#5142D8"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="7" cy="17" r="3.6" fill="#C8C2F5" />
      <circle cx="41" cy="17" r="3.6" fill="#5142D8" />
    </svg>
  );
}

export function MentraLogo({
  withWordmark = true,
  size = 28,
  className,
  wordmarkClassName = "text-[var(--mentra-ink,#20202A)]",
  ...props
}: MentraLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className ?? ""}`}
      suppressHydrationWarning
    >
      <MentraMark size={size} {...props} />
      {withWordmark ? (
        <span
          className={`text-[1.35rem] font-semibold tracking-[-0.02em] ${wordmarkClassName}`}
        >
          Mentra
        </span>
      ) : null}
    </span>
  );
}
