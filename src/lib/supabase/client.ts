
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log the values for debugging
console.log('[Supabase Client] Attempting to initialize with URL:', supabaseUrl);
console.log('[Supabase Client] Attempting to initialize with Anon Key:', supabaseAnonKey ? 'Key Present (length > 0)' : 'Key Missing or Empty');


if (!supabaseUrl || supabaseUrl.trim() === "") {
  console.error('[Supabase Client] Error: NEXT_PUBLIC_SUPABASE_URL is missing or empty.');
  throw new Error("Missing or empty env.NEXT_PUBLIC_SUPABASE_URL. Please ensure it is set in your .env file and that the file is being loaded correctly by your environment.");
}
if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  console.error('[Supabase Client] Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty.');
  throw new Error("Missing or empty env.NEXT_PUBLIC_SUPABASE_ANON_KEY. Please ensure it is set in your .env file and that the file is being loaded correctly by your environment.");
}

let supabaseInstance;
try {
  // Explicitly try to construct a URL to validate its format
  new URL(supabaseUrl); 
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} catch (e: any) {
  console.error("[Supabase Client] Error during Supabase client initialization: Invalid URL provided for NEXT_PUBLIC_SUPABASE_URL.");
  console.error("[Supabase Client] Provided Supabase URL that caused error was:", `"${supabaseUrl}"`); // Log the problematic URL
  console.error("[Supabase Client] Please check your .env file to ensure NEXT_PUBLIC_SUPABASE_URL is a complete and valid URL (e.g., https://your-project-ref.supabase.co).");
  throw new Error(`Failed to initialize Supabase client due to an invalid URL: ${e.message}`);
}

export const supabase = supabaseInstance;
