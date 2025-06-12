import { supabase } from '@/lib/supabase/client'

/**
 * Sets the current user ID in the database session
 */
export async function setCurrentUserSession(userId: string) {
  try {
    const { error } = await supabase.rpc('set_current_user_id', {
      user_id: userId,
    })

    if (error) {
      console.error('[setCurrentUserSession Error]', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[setCurrentUserSession Error]', error)
    return { error: 'Failed to set user session' }
  }
}

/**
 * Initialize user session for database operations
 */
export async function initializeUserSession() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[initializeUserSession] No authenticated user')
      return { error: 'Authentication required' }
    }

    return await setCurrentUserSession(user.id)
  } catch (error) {
    console.error('[initializeUserSession Error]', error)
    return { error: 'Failed to initialize user session' }
  }
}

/**
 * Wrapper for any database operation that needs user context
 */
export async function withUserSession<T>(operation: () => Promise<T>): Promise<T> {
  const sessionResult = await initializeUserSession()
  if (sessionResult.error) {
    throw new Error(sessionResult.error)
  }

  return await operation()
}
