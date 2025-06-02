
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

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', normalizedUsername)
    .single();

  if (error || !user) {
    // console.warn(`Login attempt failed for username: ${normalizedUsername}. User not found or Supabase error: ${error?.message}`);
    return { success: false, message: "Invalid username or password." };
  }
  
  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") {
    // console.error(`Login failed for ${normalizedUsername}: User object fetched but ID is invalid or missing.`);
    return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }

  if (user.password_text === passwordInput) {
    try {
      cookies().set(SESSION_COOKIE_NAME, user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production', // Ensure secure is true in production
        httpOnly: true, 
      });
      // console.log(`Login successful for ${normalizedUsername}, session cookie set.`);
    } catch (cookieError: any) {
      // console.error(`Login succeeded for ${normalizedUsername} but failed to set session cookie: ${cookieError.message}`);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout'); 
    redirect('/dashboard'); 
  } else {
    // console.warn(`Login attempt failed for username: ${normalizedUsername}. Password mismatch.`);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
    // console.log("User logged out, session cookie deleted.");
    revalidatePath("/", "layout"); // Revalidate all paths that might depend on user state
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    // console.error(`Logout failed due to a server error: ${e.message}`);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  let rawCookie: ReturnType<typeof cookies>['get'] | undefined;
  let userId: string | undefined;

  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
  } catch (cookieAccessError: any) {
    // This error is serious, indicates problem with cookie store access itself.
    // console.error(`[getCurrentUser] CRITICAL: Failed to execute cookies().get(): ${cookieAccessError.message}`);
    // Depending on strictness, could throw or return null. For now, return null.
    return null; 
  }

  if (!rawCookie) {
    // console.warn("[getCurrentUser] Session cookie object not found.");
    return null;
  }
  
  userId = rawCookie.value;
  if (!userId || userId.trim() === "") {
    // console.warn("[getCurrentUser] Session cookie found, but its value (userId) is empty.");
    return null;
  }

  // console.log(`[getCurrentUser] Attempting to fetch user from Supabase with ID: ${userId}`);
  const { data: user, error: dbError } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (dbError) {
    // console.error(`[getCurrentUser] Supabase error fetching user for ID ${userId}: ${dbError.message} (Code: ${dbError.code})`);
    return null;
  }

  if (!user) {
    // console.warn(`[getCurrentUser] No user found in Supabase for ID ${userId}. Cookie might be stale.`);
    return null;
  }

  // console.log(`[getCurrentUser] Successfully fetched user: ${user.username} (Role: ${user.role})`);
  return user as CurrentUser;
});


export async function getUsers(): Promise<UserView[]> {
  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
    // console.error("Error fetching users from Supabase:", error.message);
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

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no user found, which is good here.
      // console.error(`Error checking existing user during addUser: ${selectError.message}`);
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
    // console.error(`Error adding user to Supabase: ${insertError.message}`);
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
    // console.warn(`updateUserRole: Target user with ID ${userId} not found. Error: ${targetUserError?.message}`);
    return { success: false, message: "Target user not found." };
  }

  if (targetUserForRoleCheck.role === 'admin' && newRole !== 'admin') {
    const { count, error: adminCountError } = await supabase
      .from('stock_sentry_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminCountError) {
      // console.error(`updateUserRole: Could not verify admin count. Error: ${adminCountError.message}`);
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
    // console.error(`updateUserRole: Failed to update role for user ${userId}. Error: ${error.message}`);
    return { success: false, message: `Failed to update role: ${error.message}` };
  }

  if (updatedUser) {
    revalidatePath("/settings/users", "page");
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  let performingUser: CurrentUser | null = null;
  try {
    performingUser = await getCurrentUser(); 
  } catch (e) {
     // This catch is unlikely to be hit if getCurrentUser now returns null for most failures.
     // console.error(`deleteUser: Error fetching performing user: ${(e as Error).message}`);
     return { success: false, message: "Could not verify performing user's permissions." };
  }
  
  if (!performingUser) {
    // console.warn("deleteUser: Performing user not found or not authenticated.");
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
    // console.warn(`deleteUser: Target user with ID ${userId} not found for deletion. Error: ${targetUserError?.message}`);
    return { success: false, message: "User not found." };
  }

  if (targetUser.role === 'admin') {
    const { count, error: adminCountError } = await supabase
        .from('stock_sentry_users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
    if (adminCountError) {
        // console.error(`deleteUser: Could not verify admin count. Error: ${adminCountError.message}`);
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
    // console.error(`deleteUser: Failed to delete user ${userId}. Error: ${deleteError.message}`);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  try {
    const currentUser = await getCurrentUser(); // This will be the cached version
    return currentUser ? (currentUser.role?.trim().toLowerCase() as UserRole) : null;
  } catch (error) {
    // This catch is less likely if getCurrentUser mostly returns null instead of throwing.
    // console.error(`getRoleForCurrentUser: Error fetching current user: ${(error as Error).message}`);
    return null;
  }
}

    