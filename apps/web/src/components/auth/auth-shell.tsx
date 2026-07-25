import Link from "next/link";
import { MentraLogo } from "@mentra/brand";
import { RecaptchaBadgeNote } from "@/components/auth/recaptcha-badge-note";

export function AuthShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/" aria-label="Mentra home">
            <MentraLogo />
          </Link>
        </div>
        {children}
        {footer}
        <RecaptchaBadgeNote />
      </div>
    </div>
  );
}
