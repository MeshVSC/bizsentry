
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

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
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax' as const, // Ensure 'lax' is literal type
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
    };
    try {
      cookies().set(SESSION_COOKIE_NAME, user.id, cookieOptions);
      console.log(`[LoginUser] Login successful for ${normalizedUsername}. Cookie "${SESSION_COOKIE_NAME}" SET with value "${user.id}" and options: ${JSON.stringify(cookieOptions)}`);
    } catch (cookieError: any) {
      console.error(`[LoginUser] Login succeeded for ${normalizedUsername} but failed to set session cookie: ${cookieError.message}`);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout'); 
    redirect('/dashboard'); 
  } else {
    console.warn(`[LoginUser] Login attempt failed for username: ${normalizedUsername}. Password mismatch.`);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
    console.log(`[LogoutUser] User logged out, session cookie "${SESSION_COOKIE_NAME}" deleted.`);
    revalidatePath("/", "layout"); 
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    console.error(`[LogoutUser] Logout failed due to a server error: ${e.message}`);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  let rawCookie: ReturnType<typeof cookies>['get'] | undefined;
  let userId: string | undefined;

  console.log(`[GetCurrentUser (${new Date().toISOString()})] Attempting to read cookie: ${SESSION_COOKIE_NAME}`);

  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
  } catch (cookieAccessError: any) {
    console.error(`[GetCurrentUser] CRITICAL: Failed to execute cookies().get("${SESSION_COOKIE_NAME}"): ${cookieAccessError.message}`);
    return null; 
  }

  if (!rawCookie) {
    console.warn(`[GetCurrentUser] Session cookie object "${SESSION_COOKIE_NAME}" not found by cookies().get().`);
    return null;
  }
  
  console.log(`[GetCurrentUser] Raw cookie object found: ${JSON.stringify(rawCookie)}`);
  userId = rawCookie.value;

  if (!userId || userId.trim() === "") {
    console.warn(`[GetCurrentUser] Session cookie "${SESSION_COOKIE_NAME}" found, but its value (userId) is empty or whitespace.`);
    return null;
  }

  console.log(`[GetCurrentUser] Valid userId "${userId}" found in cookie. Attempting to fetch user from Supabase.`);
  const { data: user, error: dbError } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (dbError) {
    console.error(`[GetCurrentUser] Supabase error fetching user for ID "${userId}": ${dbError.message} (Code: ${dbError.code})`);
    return null;
  }

  if (!user) {
    console.warn(`[GetCurrentUser] No user found in Supabase for ID "${userId}". Cookie might be stale or user deleted.`);
    return null;
  }

  console.log(`[GetCurrentUser] Successfully fetched user: ${user.username} (Role: ${user.role}, ID: ${user.id})`);
  return user as CurrentUser;
});


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
  console.log(`[AddUser] Attempting to add user: ${normalizedUsername}, Role: ${data.role}`);
  const { data: existingUser, error: selectError } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .ilike('username', normalizedUsername)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { 
      console.error(`[AddUser] Error checking existing user: ${selectError.message}`);
      return { success: false, message: `Error checking existing user: ${selectError.message}` };
  }
  if (existingUser) {
    console.warn(`[AddUser] User with username "${data.username}" already exists.`);
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
    console.error(`[AddUser] Error adding user to Supabase: ${insertError.message}`);
    return { success: false, message: `Failed to add user: ${insertError.message}` };
  }

  if (newUser) {
    console.log(`[AddUser] User "${newUser.username}" added successfully.`);
    revalidatePath("/settings/users", "page");
    return { success: true, message: `User "${newUser.username}" added successfully.`, user: newUser as UserView };
  }
  return { success: false, message: "Failed to add user for an unknown reason."};
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  console.log(`[UpdateUserRole] Attempting to update role for user ID ${userId} to ${newRole}`);
  const { data: targetUserForRoleCheck, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('role, username')
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUserForRoleCheck) {
    console.warn(`[UpdateUserRole] Target user with ID ${userId} not found. Error: ${targetUserError?.message}`);
    return { success: false, message: "Target user not found." };
  }

  if (targetUserForRoleCheck.role === 'admin' && newRole !== 'admin') {
    const { count, error: adminCountError } = await supabase
      .from('stock_sentry_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminCountError) {
      console.error(`[UpdateUserRole] Could not verify admin count. Error: ${adminCountError.message}`);
      return { success: false, message: "Could not verify admin count."};
    }
    if (count !== null && count <= 1) {
      console.warn(`[UpdateUserRole] Attempt to demote last admin (ID: ${userId}) was blocked.`);
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
    console.error(`[UpdateUserRole] Failed to update role for user ${userId}. Error: ${error.message}`);
    return { success: false, message: `Failed to update role: ${error.message}` };
  }

  if (updatedUser) {
    console.log(`[UpdateUserRole] User "${updatedUser.username}" role updated to ${newRole}.`);
    revalidatePath("/settings/users", "page");
    // Check if the current user's role was changed and update their session if so
    const selfUpdateCheck = await getCurrentUser(); // This will use the cached value
    if (selfUpdateCheck && selfUpdateCheck.id === userId && selfUpdateCheck.role !== newRole) {
        // This scenario (admin demoting themselves) is complex for session management
        // with cookies. A full re-login might be safest.
        // For now, the revalidatePath('/') might refresh the layout if it re-fetches user.
        console.warn(`[UpdateUserRole] User ${userId} changed their own role. Session may need to be manually refreshed by user (logout/login) if immediate effect on current page is needed.`);
        revalidatePath("/", "layout");
    }
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  let performingUser: CurrentUser | null = null;
  try {
    performingUser = await getCurrentUser(); // Relies on React.cache
  } catch (e) {
     console.error(`[DeleteUser] Error fetching performing user: ${(e as Error).message}`);
     return { success: false, message: "Could not verify performing user's permissions." };
  }
  
  if (!performingUser) {
    console.warn("[DeleteUser] Performing user not found or not authenticated.");
    return { success: false, message: "Action requires authentication." };
  }
  console.log(`[DeleteUser] User ${performingUser.username} (Role: ${performingUser.role}) attempting to delete user ID: ${userId}`);


  if (performingUser.role?.trim().toLowerCase() !== 'admin') {
    console.warn(`[DeleteUser] Permission denied for ${performingUser.username} to delete user ${userId}. Not an admin.`);
    return { success: false, message: "Permission denied: Only admins can delete users." };
  }

  if (performingUser.id === userId) {
    console.warn(`[DeleteUser] User ${performingUser.username} attempted to delete self.`);
    return { success: false, message: "Cannot delete your own account." };
  }

  const { data: targetUser, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('username, role')
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUser) {
    console.warn(`[DeleteUser] Target user with ID ${userId} not found for deletion. Error: ${targetUserError?.message}`);
    return { success: false, message: "User not found." };
  }

  if (targetUser.role === 'admin') {
    const { count, error: adminCountError } = await supabase
        .from('stock_sentry_users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
    if (adminCountError) {
        console.error(`[DeleteUser] Could not verify admin count. Error: ${adminCountError.message}`);
        return { success: false, message: "Could not verify admin count."};
    }
    if (count !== null && count <= 1) {
        console.warn(`[DeleteUser] Attempt to delete last admin (ID: ${userId}, Username: ${targetUser.username}) was blocked.`);
        return { success: false, message: "Cannot delete the last administrator." };
    }
  }

  const { error: deleteError } = await supabase
    .from('stock_sentry_users')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    console.error(`[DeleteUser] Failed to delete user ${userId} (Username: ${targetUser.username}). Error: ${deleteError.message}`);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  console.log(`[DeleteUser] User "${targetUser.username}" (ID: ${userId}) deleted successfully by ${performingUser.username}.`);
  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  try {
    const currentUser = await getCurrentUser(); 
    return currentUser ? (currentUser.role?.trim().toLowerCase() as UserRole) : null;
  } catch (error) {
    console.error(`[GetRoleForCurrentUser] Error fetching current user: ${(error as Error).message}`);
    return null;
  }
}
    
