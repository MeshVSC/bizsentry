import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const withUserSession = async (handler: (client: SupabaseClient) => Promise<unknown>) => {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // For now, skip auth check and use the admin user approach
    // This is a temporary fix until proper auth is implemented
    return await handler(supabase);
  } catch (error) {
    console.error('Error in withUserSession:', error);
    throw error;
  }
};