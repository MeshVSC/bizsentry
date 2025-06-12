import { getSession } from './supabase-session';

export const withUserSession = async (handler: (session: any) => Promise<any>) => {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Auth session missing!');
    }
    return await handler(session);
  } catch (error) {
    console.error('Error in withUserSession:', error);
    throw error;
  }
};