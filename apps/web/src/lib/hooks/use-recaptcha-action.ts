"use client";

import { useCallback, useState } from "react";
import {
  getRecaptchaToken,
  verifyRecaptchaToken,
} from "@/lib/recaptcha/client";

export function useRecaptchaAction(action: string) {
  const [verifying, setVerifying] = useState(false);

  const runWithRecaptcha = useCallback(
    async <T,>(fn: () => Promise<T> | T): Promise<
      | { ok: true; result: T }
      | { ok: false; error: string }
    > => {
      setVerifying(true);
      try {
        const token = await getRecaptchaToken(action);
        const check = await verifyRecaptchaToken(token, action);
        if (!check.ok) {
          return {
            ok: false,
            error: check.error ?? "reCAPTCHA verification failed.",
          };
        }
        const result = await fn();
        return { ok: true, result };
      } finally {
        setVerifying(false);
      }
    },
    [action],
  );

  return { runWithRecaptcha, verifying };
}
