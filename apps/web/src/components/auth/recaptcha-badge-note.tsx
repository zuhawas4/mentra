"use client";

import { getRecaptchaSiteKey } from "@/lib/recaptcha/config";

export function RecaptchaBadgeNote() {
  const configured = Boolean(getRecaptchaSiteKey());

  return (
    <p className="text-center text-[11px] leading-relaxed text-[var(--mentra-muted)]">
      {configured ? (
        <>
          This site is protected by reCAPTCHA and the Google{" "}
          <a
            className="underline hover:text-[var(--mentra-ink)]"
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            className="underline hover:text-[var(--mentra-ink)]"
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>{" "}
          apply.
        </>
      ) : (
        <>reCAPTCHA v3 is inactive in demo mode (keys not configured).</>
      )}
    </p>
  );
}
