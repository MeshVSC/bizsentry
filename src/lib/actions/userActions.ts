
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
// Removed React.cache import

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

export interface GetCurrentUserResult { // Kept for structure, but debugMessage less critical now
  user: CurrentUser | null;
  debugMessage?: string; // Can be simplified or removed if not used by layout directly
}

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string } | void> {
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;

  if (!usernameInput || !passwordInput) {
    return { success: false, message: "Username and password are required." };
  }

  const normalizedUsername = usernameInput.trim().toLowerCase();

  console.log(`[LoginUser] Attempting login for username: ${normalizedUsername}`);

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', normalizedUsername)
    .single();

  if (error || !user) {
    console.warn(`[LoginUser] Login attempt failed for username: ${normalizedUsername}. User not found or Supabase error: ${error?.message}`);
    return { success: false, message: "Invalid username or password." };
  }
  
  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") {
     console.error(`[LoginUser] Login failed for ${normalizedUsername}: User object fetched but ID is invalid or missing.`);
     return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }

  if (user.password_text === passwordInput) {
    console.log(`[LoginUser] Password match for ${normalizedUsername}. Setting cookie.`);
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    };
    try {
      cookies().set(SESSION_COOKIE_NAME, user.id, cookieOptions);
      console.log(`[LoginUser] Cookie SET: name=${SESSION_COOKIE_NAME}, value=${user.id}, options=${JSON.stringify(cookieOptions)}`);
    } catch (cookieError: any) {
      console.error(`[LoginUser] Login succeeded for ${normalizedUsername} but failed to set session cookie: ${cookieError.message}`);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard'); // This will trigger a new request, where getCurrentUser will be called.
  } else {
    console.warn(`[LoginUser] Login attempt failed for username: ${normalizedUsername}. Password mismatch.`);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    console.log(`[LogoutUser] Attempting to delete cookie: ${SESSION_COOKIE_NAME}`);
    cookies().delete(SESSION_COOKIE_NAME);
    console.log(`[LogoutUser] Cookie deleted. Revalidating path and preparing redirect.`);
    revalidatePath("/", "layout");
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    console.error(`[LogoutUser] Logout failed: ${e.message}`);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

// Not wrapped with React.cache anymore
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const timestamp = new Date().toISOString();
  let rawCookie: ReturnType<typeof cookies>['get'] | undefined;
  let userId: string | undefined;

  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
  } catch (cookieAccessError: any) {
    // This error means cookies() itself or .get() failed, which is severe.
    console.error(`[GetCurrentUser (${timestamp})] CRITICAL: Failed to execute cookies().get("${SESSION_COOKIE_NAME}"): ${cookieAccessError.message}`);
    // Depending on policy, could throw or return null with specific error for layout to handle
    return null; // Simplest for now: if cookie access fails, treat as no user.
  }

  if (!rawCookie) {
    // console.log(`[GetCurrentUser (${timestamp})] Session cookie object "${SESSION_COOKIE_NAME}" not found by cookies().get().`);
    return null;
  }

  userId = rawCookie.value;

  if (!userId || userId.trim() === "") {
    // console.log(`[GetCurrentUser (${timestamp})] Session cookie "${SESSION_COOKIE_NAME}" found, but value (userId) is empty/whitespace. Cookie: ${JSON.stringify(rawCookie)}`);
    return null;
  }

  // console.log(`[GetCurrentUser (${timestamp})] Found cookie with userId: "${userId}". Fetching from Supabase.`);
  const { data: dbUser, error: dbError } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (dbError) {
    // console.error(`[GetCurrentUser (${timestamp})] Supabase error fetching user for ID "${userId}": ${dbError.message} (Code: ${dbError.code})`);
    return null;
  }

  if (!dbUser) {
    // console.log(`[GetCurrentUser (${timestamp})] No user found in Supabase for ID "${userId}". Cookie might be stale or user deleted.`);
    return null;
  }
  
  // console.log(`[GetCurrentUser (${timestamp})] Successfully fetched user: ${dbUser.username} (Role: ${dbUser.role}, ID: ${dbUser.id})`);
  return dbUser as CurrentUser;
}


export async function getUsers(): Promise<UserView[]> {
  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
    console.error("[GetUsers] Error fetching users from Supabase:", error.message);
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

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found, which is good here.
      return { success: false, message: `Error checking existing user: ${selectError.message}` };
  }
  if (existingUser) {
    return { success: false, message: `User with username "${data.username}" already exists.` };
  }

  const { data: newUser, error: insertError } = await supabase
    .from('stock_sentry_users')
    .insert({
      username: normalizedUsername,
      password_text: data.password, // Storing password in plaintext
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
    // If the current user's own role changed, their session data in AuthContext might become stale
    // but AppLayout should refetch on next full navigation.
    // No direct way to update AuthContext from server action without page reload.
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  const performingUser = await getCurrentUser();

  if (!performingUser) {
    return { success: false, message: "Action requires authentication." };
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

export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user ? (user.role?.trim().toLowerCase() as UserRole) : null;
}
