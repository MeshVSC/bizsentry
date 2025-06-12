import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error('Auth session missing!');
  }
  return data.session;
};

export default supabase;
