"use client";

export interface TwoFactorConfig {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  enabledAt?: string;
}

const STORAGE_KEY = "mentra-2fa-by-email";

function readAll(): Record<string, TwoFactorConfig> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      TwoFactorConfig
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, TwoFactorConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getTwoFactorConfig(email: string): TwoFactorConfig {
  const key = email.trim().toLowerCase();
  return readAll()[key] ?? { enabled: false };
}

export function setTwoFactorConfig(email: string, config: TwoFactorConfig) {
  const key = email.trim().toLowerCase();
  const map = readAll();
  map[key] = config;
  writeAll(map);
}

export function clearTwoFactorConfig(email: string) {
  const key = email.trim().toLowerCase();
  const map = readAll();
  delete map[key];
  writeAll(map);
}

export function consumeBackupCode(email: string, code: string): boolean {
  const key = email.trim().toLowerCase();
  const map = readAll();
  const config = map[key];
  if (!config?.enabled || !config.backupCodes?.length) return false;
  const normalized = code.trim().toUpperCase();
  const idx = config.backupCodes.findIndex(
    (c) => c.toUpperCase() === normalized,
  );
  if (idx === -1) return false;
  config.backupCodes = config.backupCodes.filter((_, i) => i !== idx);
  map[key] = config;
  writeAll(map);
  return true;
}
