import { Secret, TOTP } from "otpauth";

const ISSUER = "Mentra";

export function generateTotpSecret(email: string) {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export function verifyTotpCode(secretBase32: string, token: string) {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
  const delta = totp.validate({ token: token.replace(/\s/g, ""), window: 1 });
  return delta !== null;
}

export function generateBackupCodes(count = 6) {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = Math.random().toString(36).slice(2, 8).toUpperCase();
    codes.push(`${chunk.slice(0, 3)}-${chunk.slice(3)}`);
  }
  return codes;
}
