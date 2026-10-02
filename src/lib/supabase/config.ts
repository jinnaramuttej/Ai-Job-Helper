/** Supabase configuration shared by the browser and server clients. */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Private bucket that holds resume files, one folder per student. */
export const RESUME_BUCKET = "resumes";

/**
 * True when the browser has everything it needs to talk to Supabase.
 * When false, the data layer falls back to the local demo implementation
 * so the app still runs before credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
