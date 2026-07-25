"use client";

import { getRecaptchaSiteKey } from "./config";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "mentra-recaptcha-v3";

let loading: Promise<void> | null = null;

function loadScript(siteKey: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });

  return loading;
}

export async function getRecaptchaToken(action: string): Promise<string | null> {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) return null;

  await loadScript(siteKey);
  if (!window.grecaptcha) return null;

  return new Promise((resolve) => {
    window.grecaptcha!.ready(async () => {
      try {
        const token = await window.grecaptcha!.execute(siteKey, { action });
        resolve(token);
      } catch {
        resolve(null);
      }
    });
  });
}

export async function verifyRecaptchaToken(
  token: string | null,
  action: string,
): Promise<{ ok: boolean; bypassed?: boolean; error?: string }> {
  if (!token) {
    // Demo / local: keys not configured → allow
    if (!getRecaptchaSiteKey()) {
      return { ok: true, bypassed: true };
    }
    return { ok: false, error: "reCAPTCHA token missing." };
  }

  const res = await fetch("/api/recaptcha/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, action }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    bypassed?: boolean;
    error?: string;
  };

  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error ?? "reCAPTCHA verification failed." };
  }
  return { ok: true, bypassed: data.bypassed };
}
