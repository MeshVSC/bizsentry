import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

/**
 * Wrap a database operation to ensure it executes with a user session.
 * This implementation simply executes the provided callback because
 * authentication is not currently implemented.
 */
export async function withUserSession<T>(fn: (supabase: SupabaseClient) => Promise<T>): Promise<T> {
  return fn(supabase);
}
