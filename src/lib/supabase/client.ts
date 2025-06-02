
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Log the raw environment variable values as seen by this module
// console.log('[Supabase Client Env Check] Attempting to read NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log('[Supabase Client Env Check] Attempting to read NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Key Present' : 'Key Missing or Empty');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!supabaseUrl || supabaseUrl.trim() === "") {
  const baseMessage = "NEXT_PUBLIC_SUPABASE_URL is missing or empty.";
  const fullMessage = `Missing or empty env.NEXT_PUBLIC_SUPABASE_URL. Please ensure it is set in your .env file (as per README.md) and that the file is being loaded correctly by your environment.`;
  
  if (isBuildPhase) {
    console.error(`[Supabase Client Init Error - BUILD PHASE] ${baseMessage}`);
    console.error("[Supabase Client Init Error - BUILD PHASE] This often means your build environment does not have access to the .env file or the required environment variables. Check your CI/CD or hosting provider's environment variable settings, or ensure your .env file is correctly populated and included in the build context.");
    throw new Error(`BUILD ERROR: ${fullMessage}`);
  } else {
    console.error(`[Supabase Client Init Error] ${baseMessage}`);
    throw new Error(fullMessage);
  }
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  const baseMessage = "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty.";
  const fullMessage = `Missing or empty env.NEXT_PUBLIC_SUPABASE_ANON_KEY. Please ensure it is set in your .env file (as per README.md) and that the file is being loaded correctly by your environment.`;

  if (isBuildPhase) {
    console.error(`[Supabase Client Init Error - BUILD PHASE] ${baseMessage}`);
    console.error("[Supabase Client Init Error - BUILD PHASE] This often means your build environment does not have access to the .env file or the required environment variables. Check your CI/CD or hosting provider's environment variable settings, or ensure your .env file is correctly populated and included in the build context.");
    throw new Error(`BUILD ERROR: ${fullMessage}`);
  } else {
    console.error(`[Supabase Client Init Error] ${baseMessage}`);
    throw new Error(fullMessage);
  }
}

let supabaseInstance: SupabaseClient;

try {
  new URL(supabaseUrl); 
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  // console.log("[Supabase Client Init Success] Supabase client initialized.");
} catch (e: any) {
  const errorMessage = `Failed to initialize Supabase client: ${e.message}.`;
  console.error("[Supabase Client Init Error] Error during Supabase client initialization.");
  console.error("[Supabase Client Init Error] Provided Supabase URL that caused error was:", `"${supabaseUrl}"`);
  console.error("[Supabase Client Init Error] Provided Supabase Anon Key was:", `"${supabaseAnonKey ? 'Key Present (length: ' + supabaseAnonKey.length + ')' : 'Key Missing or Empty'}"`);
  console.error("[Supabase Client Init Error] The error was:", e.message);
  
  if (isBuildPhase) {
     console.error("[Supabase Client Init Error - BUILD PHASE] Please check your .env file to ensure NEXT_PUBLIC_SUPABASE_URL is a complete and valid URL (e.g., https://your-project-ref.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY is correct. These must be available to the build process.");
    throw new Error(`BUILD ERROR: ${errorMessage} Check server console for details on the provided URL and Key. Ensure your build environment has these variables set.`);
  } else {
    console.error("[Supabase Client Init Error] Please check your .env file to ensure NEXT_PUBLIC_SUPABASE_URL is a complete and valid URL (e.g., https://your-project-ref.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY is correct.");
    throw new Error(`${errorMessage} Check server console for details on the provided URL and Key.`);
  }
}

export const supabase = supabaseInstance;
