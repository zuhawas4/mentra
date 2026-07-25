function getSupabaseKey() {
  // Prefer classic anon JWT; fall back to newer publishable key.
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

export function isSupabaseConfigured() {
  if (process.env.NEXT_PUBLIC_FORCE_DEMO === "true") return false;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseKey());
}

export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: getSupabaseKey(),
  };
}
