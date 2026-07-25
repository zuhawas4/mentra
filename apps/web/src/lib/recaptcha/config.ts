export function isRecaptchaConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY &&
      process.env.RECAPTCHA_SECRET_KEY,
  );
}

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
}

export function getRecaptchaSecretKey() {
  return process.env.RECAPTCHA_SECRET_KEY ?? "";
}

/** Minimum score accepted for v3 (0.0–1.0). */
export const RECAPTCHA_MIN_SCORE = 0.5;
