
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Log the raw environment variable values as seen by this module
console.log('[Supabase Client Env Check] Attempting to read NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('[Supabase Client Env Check] Attempting to read NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Key Present' : 'Key Missing or Empty');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.trim() === "") {
  console.error("[Supabase Client Init Error] NEXT_PUBLIC_SUPABASE_URL is missing or empty.");
  throw new Error("Missing or empty env.NEXT_PUBLIC_SUPABASE_URL. Please ensure it is set in your .env file and that the file is being loaded correctly by your environment.");
}
if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  console.error("[Supabase Client Init Error] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty.");
  throw new Error("Missing or empty env.NEXT_PUBLIC_SUPABASE_ANON_KEY. Please ensure it is set in your .env file and that the file is being loaded correctly by your environment.");
}

let supabaseInstance: SupabaseClient;

try {
  // Validate the URL structure before passing to createClient
  new URL(supabaseUrl); // This will throw an error if supabaseUrl is not a valid URL
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  console.log("[Supabase Client Init Success] Supabase client initialized.");
} catch (e: any) {
  console.error("[Supabase Client Init Error] Error during Supabase client initialization.");
  console.error("[Supabase Client Init Error] Provided Supabase URL that caused error was:", `"${supabaseUrl}"`);
  console.error("[Supabase Client Init Error] Provided Supabase Anon Key was:", `"${supabaseAnonKey ? 'Key Present (length: ' + supabaseAnonKey.length + ')' : 'Key Missing or Empty'}"`);
  console.error("[Supabase Client Init Error] The error was:", e.message);
  console.error("[Supabase Client Init Error] Please check your .env file to ensure NEXT_PUBLIC_SUPABASE_URL is a complete and valid URL (e.g., https://your-project-ref.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY is correct.");
  throw new Error(`Failed to initialize Supabase client: ${e.message}. Check server console for details on the provided URL and Key.`);
}

export const supabase = supabaseInstance;
