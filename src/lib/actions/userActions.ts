
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
// import { cache } from 'react'; // React.cache temporarily removed for this specific test

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

export interface GetCurrentUserResult {
  user: CurrentUser | null;
  debugMessage?: string;
}

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string } | void> {
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;
  const timestamp = new Date().toISOString();
  console.log(`[LoginUser (${timestamp})] Attempting login for username: ${usernameInput}`);

  if (!usernameInput || !passwordInput) {
    console.warn(`[LoginUser (${timestamp})] Login failed: Username or password not provided.`);
    return { success: false, message: "Username and password are required." };
  }

  const normalizedUsername = usernameInput.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', normalizedUsername)
    .single();

  if (error || !user) {
    console.warn(`[LoginUser (${timestamp})] Login failed for username: ${normalizedUsername}. User not found or Supabase error: ${error?.message}`);
    return { success: false, message: "Invalid username or password." };
  }
  
  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") {
     console.error(`[LoginUser (${timestamp})] Login failed for ${normalizedUsername}: User object fetched but ID is invalid or missing.`);
     return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }

  if (user.password_text === passwordInput) {
    console.log(`[LoginUser (${timestamp})] Password match for ${normalizedUsername}. Setting cookie.`);
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    };
    try {
      cookies().set(SESSION_COOKIE_NAME, user.id, cookieOptions);
      // console.log(`[LoginUser (${timestamp})] Cookie SET: name=${SESSION_COOKIE_NAME}, value=${user.id}, options=${JSON.stringify(cookieOptions)}`);
    } catch (cookieError: any) {
      console.error(`[LoginUser (${timestamp})] Login succeeded for ${normalizedUsername} but failed to set session cookie: ${cookieError.message}`);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard'); 
  } else {
    console.warn(`[LoginUser (${timestamp})] Login attempt failed for username: ${normalizedUsername}. Password mismatch.`);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  const timestamp = new Date().toISOString();
  try {
    // console.log(`[LogoutUser (${timestamp})] Attempting to delete cookie: ${SESSION_COOKIE_NAME}`);
    cookies().delete(SESSION_COOKIE_NAME);
    // console.log(`[LogoutUser (${timestamp})] Cookie deleted. Revalidating path and preparing redirect.`);
    revalidatePath("/", "layout");
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    // console.error(`[LogoutUser (${timestamp})] Logout failed: ${e.message}`);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

// React.cache temporarily removed for this specific test
export async function getCurrentUser(): Promise<GetCurrentUserResult> {
  const timestamp = new Date().toISOString();
  let rawCookie: ReturnType<typeof cookies>['get'] | undefined;
  let userId: string | undefined;
  let debugMessage = `[GetCurrentUser (${timestamp})] Initializing.`;

  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
  } catch (cookieAccessError: any) {
    debugMessage += ` CRITICAL: Failed to execute cookies().get("${SESSION_COOKIE_NAME}"): ${cookieAccessError.message}.`;
    // console.error(debugMessage);
    return { user: null, debugMessage };
  }

  if (!rawCookie) {
    debugMessage += ` Session cookie object "${SESSION_COOKIE_NAME}" not found by cookies().get().`;
    // console.warn(debugMessage);
    return { user: null, debugMessage };
  }
  
  userId = rawCookie.value;
  debugMessage += ` Session cookie object "${SESSION_COOKIE_NAME}" found: value='${userId}'.`;

  if (!userId || userId.trim() === "") {
    debugMessage += ` Cookie value (userId) is empty/whitespace.`;
    // console.warn(debugMessage);
    return { user: null, debugMessage };
  }

  debugMessage += ` Fetching from Supabase with userId: "${userId}".`;
  const { data: dbUser, error: dbError } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (dbError) {
    debugMessage += ` Supabase error fetching user for ID "${userId}": ${dbError.message} (Code: ${dbError.code}).`;
    // console.error(debugMessage);
    return { user: null, debugMessage };
  }

  if (!dbUser) {
    debugMessage += ` No user found in Supabase for ID "${userId}". Cookie might be stale or user deleted.`;
    // console.warn(debugMessage);
    return { user: null, debugMessage };
  }
  
  debugMessage += ` Successfully fetched user: ${dbUser.username} (Role: ${dbUser.role}, ID: ${dbUser.id}).`;
  // console.log(debugMessage);
  return { user: dbUser as CurrentUser, debugMessage };
}


export async function getUsers(): Promise<UserView[]> {
  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
    // console.error("[GetUsers] Error fetching users from Supabase:", error.message);
    return [];
  }
  return (data as UserView[]) || [];
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  if (!data.username || !data.password || !data.role) {
    return { success: false, message: "Username, password, and role are required." };
  }
   if (data.password.length < 5 || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password) ) {
    return { success: false, message: "Password does not meet requirements (min 5 chars, 1 uppercase, 1 number)." };
  }

  const normalizedUsername = data.username.trim().toLowerCase();
  const { data: existingUser, error: selectError } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .ilike('username', normalizedUsername)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { 
      return { success: false, message: `Error checking existing user: ${selectError.message}` };
  }
  if (existingUser) {
    return { success: false, message: `User with username "${data.username}" already exists.` };
  }

  const { data: newUser, error: insertError } = await supabase
    .from('stock_sentry_users')
    .insert({
      username: normalizedUsername,
      password_text: data.password, 
      role: data.role,
    })
    .select('id, username, role, created_at, updated_at')
    .single();

  if (insertError) {
    return { success: false, message: `Failed to add user: ${insertError.message}` };
  }

  if (newUser) {
    revalidatePath("/settings/users", "page");
    return { success: true, message: `User "${newUser.username}" added successfully.`, user: newUser as UserView };
  }
  return { success: false, message: "Failed to add user for an unknown reason."};
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const authResult = await getCurrentUser();
  if (!authResult.user) {
      return { success: false, message: "Action requires authentication. " + (authResult.debugMessage || "") };
  }

  const { data: targetUserForRoleCheck, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('role, username')
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUserForRoleCheck) {
    return { success: false, message: "Target user not found." };
  }

  if (targetUserForRoleCheck.role === 'admin' && newRole !== 'admin') {
    const { count, error: adminCountError } = await supabase
      .from('stock_sentry_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminCountError) {
      return { success: false, message: "Could not verify admin count."};
    }
    if (count !== null && count <= 1) {
      return { success: false, message: "Cannot remove the last administrator's role." };
    }
  }

  const { data: updatedUser, error } = await supabase
    .from('stock_sentry_users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, username, role, created_at, updated_at')
    .single();

  if (error) {
    return { success: false, message: `Failed to update role: ${error.message}` };
  }

  if (updatedUser) {
    revalidatePath("/settings/users", "page");
    // If the current user is the one being updated, we might need to update their session/context.
    // For now, focusing on the admin panel case. Re-login might be required for self-update to take full effect.
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  const authResult = await getCurrentUser();
  const performingUser = authResult.user;

  if (!performingUser) {
    return { success: false, message: "Action requires authentication. " + (authResult.debugMessage || "") };
  }

  if (performingUser.role?.trim().toLowerCase() !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can delete users." };
  }

  if (performingUser.id === userId) {
    return { success: false, message: "Cannot delete your own account." };
  }

  const { data: targetUser, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('username, role')
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUser) {
    return { success: false, message: "User not found." };
  }

  if (targetUser.role === 'admin') {
    const { count, error: adminCountError } = await supabase
        .from('stock_sentry_users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
    if (adminCountError) {
        return { success: false, message: "Could not verify admin count."};
    }
    if (count !== null && count <= 1) {
        return { success: false, message: "Cannot delete the last administrator." };
    }
  }

  const { error: deleteError } = await supabase
    .from('stock_sentry_users')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

// Helper, not directly exported for client use unless necessary
export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  const { user } = await getCurrentUser(); // Call the modified version
  return user ? (user.role?.trim().toLowerCase() as UserRole) : null;
}
