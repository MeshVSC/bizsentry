import React from 'react';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/supabase-session';

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Get authenticated user and set session for server-side operations
 */
export async function initializeServerUserSession() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('[initializeServerUserSession] No authenticated user:', authError)
      return { error: 'Authentication required' }
    }

    // Set the user session in the database
    const { error: sessionError } = await supabase.rpc('set_current_user_id', {
      user_id: user.id
    })

    if (sessionError) {
      console.error('[initializeServerUserSession] Failed to set session:', sessionError)
      return { error: 'Failed to set user session' }
    }
    
    return { success: true, user, supabase }
  } catch (error) {
    console.error('[initializeServerUserSession Error]', error)
    return { error: 'Failed to initialize user session' }
  }
}

/**
 * Wrapper for server-side database operations that need user context
 */
export async function withServerUserSession<T>(
  operation: (supabase: any, user: any) => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const result = await initializeServerUserSession()
    
    if (result.error) {
      return { error: result.error }
    }
    
    const data = await operation(result.supabase!, result.user!)
    return { data }
  } catch (error) {
    console.error('[withServerUserSession Error]', error)
    return { error: 'Operation failed' }
  }
}

// Updated server-side database functions
export async function getItemById(id: string) {
  return withServerUserSession(async (supabase, user) => {
    console.log(`[getItemById] Fetching item ${id} for user ${user.id}`)
    
    const { data, error } = await supabase
      .from('items') // Replace with your table name
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`[getItemById Error] Item ID '${id}':`, error)
      throw new Error(error.message)
    }

    return data
  })
}

export async function updateItem(id: string, updateData: any) {
  return withServerUserSession(async (supabase, user) => {
    console.log(`[updateItem] Updating item ${id} for user ${user.id}`)
    
    const payload = {
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('items') // Replace with your table name
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`[updateItem Error] Item ID '${id}':`, error)
      throw new Error(error.message)
    }

    return data
  })
}

export async function getAllItems(filters?: { name?: string; category?: string; page?: number; limit?: number }) {
  return withServerUserSession(async (supabase, user) => {
    console.log(`[getAllItems] Fetching items for user ${user.id}`)
    
    let query = supabase
      .from('items') // Replace with your table name
      .select('*')
    
    // Apply filters if provided
    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    // Apply pagination
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit
      const to = from + filters.limit - 1
      query = query.range(from, to)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[getAllItems Error]:', error)
      throw new Error(error.message)
    }

    return data
  })
}

export default async function InventoryPage() {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Auth session missing!');
    }

    // Proceed with page logic
return {
  success: true,
  message: 'Inventory Page'
};
} catch (error) {
  console.error('Error fetching session:', error);
  return {
    success: false,
    message: 'Please log in to access this page.'
  };
}
