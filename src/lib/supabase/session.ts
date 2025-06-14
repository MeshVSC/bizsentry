import supabase from '../supabase-session';

export const withUserSession = async (handler: (client: any) => Promise<any>) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('Auth session missing!');
    }
    return await handler(supabase);
  } catch (error) {
    console.error('Error in withUserSession:', error);
    throw error;
  }
};