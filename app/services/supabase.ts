import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return _supabase;
}
