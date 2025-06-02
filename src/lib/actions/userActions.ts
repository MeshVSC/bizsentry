
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
// import { cache } from 'react'; // React.cache temporarily removed for this specific test

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

  // console.log(`[LoginUser] Attempting to fetch user: ${normalizedUsername}`);
  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', normalizedUsername)
    .single();

  if (error || !user) {
    // console.error("[LoginUser] Supabase error or user not found:", error);
    return { success: false, message: "Invalid username or password." };
  }

  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") {
    // console.error("[LoginUser] User found but ID is invalid:", user.id);
    return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }

  // console.log(`[LoginUser] User fetched: ${user.id}, role: ${user.role}`);

  if (user.password_text === passwordInput) {
    try {
      // console.log(`[LoginUser] Credentials valid for user ID: ${user.id}. Attempting to set cookie.`);
      cookies().set(SESSION_COOKIE_NAME, user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: true, 
        httpOnly: true, // Ensure httpOnly is true for security
      });
      // console.log(`[LoginUser] Cookie for user ID ${user.id} should be set with httpOnly: true.`);
    } catch (cookieError: any) {
      // console.error("[LoginUser] Cookie setting error:", cookieError);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout'); 
    // console.log("[LoginUser] Redirecting to /dashboard.");
    redirect('/dashboard'); 
  } else {
    // console.warn("[LoginUser] Password mismatch for user:", normalizedUsername);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
    revalidatePath("/", "layout");
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    // console.error("[LogoutUser] Error during logout:", e);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

// getCurrentUser WITHOUT React.cache for this test
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  let userId: string | undefined;
  let rawCookie: ReturnType<typeof cookies>['get'] | undefined;
  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
    userId = rawCookie?.value;
    // console.log("[GetCurrentUser NO-CACHE] Attempting to read cookie. Raw cookie:", rawCookie, "User ID from cookie:", userId);
  } catch (cookieError: any) {
    // console.error("[GetCurrentUser NO-CACHE] Error reading cookie:", cookieError);
    throw new Error(`SESSION_COOKIE_READ_ERROR: ${cookieError.message}`);
  }

  if (!rawCookie) {
    // console.log("[GetCurrentUser NO-CACHE] Session cookie object not found.");
    throw new Error("SESSION_COOKIE_NOT_FOUND_OBJECT");
  }
  if (!userId || userId.trim() === "") {
    // console.log("[GetCurrentUser NO-CACHE] Session cookie found, but its value (userId) is empty.");
    throw new Error("SESSION_COOKIE_VALUE_EMPTY");
  }

  // console.log(`[GetCurrentUser NO-CACHE] Found userId in cookie: ${userId}. Querying Supabase.`);
  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (error) {
    // console.error(`[GetCurrentUser NO-CACHE] Supabase error fetching user ID ${userId}:`, error);
    if (error.code === 'PGRST116') { 
      throw new Error(`SUPABASE_USER_NOT_FOUND_FOR_ID: ${userId}`);
    }
    throw new Error(`SUPABASE_QUERY_ERROR: ${error.message} (Code: ${error.code})`);
  }

  if (!user) {
    // console.warn(`[GetCurrentUser NO-CACHE] Supabase query for ID ${userId} returned no error, but no user object.`);
    throw new Error(`SUPABASE_USER_NOT_FOUND_DESPITE_NO_ERROR_FOR_ID: ${userId}`);
  }
  // console.log("[GetCurrentUser NO-CACHE] Successfully fetched user:", user);
  return user as CurrentUser;
};


export async function getUsers(): Promise<UserView[]> {
  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
    // console.error("[GetUsers] Error fetching users:", error);
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
      // console.error("[AddUser] Error checking existing user:", selectError);
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
    // console.error("[AddUser] Error inserting new user:", insertError);
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
    // console.error(`[UpdateUserRole] Target user ${userId} not found:`, targetUserError);
    return { success: false, message: "Target user not found." };
  }

  if (targetUserForRoleCheck.role === 'admin' && newRole !== 'admin') {
    const { count, error: adminCountError } = await supabase
      .from('stock_sentry_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminCountError) {
      // console.error("[UpdateUserRole] Could not verify admin count:", adminCountError);
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
    // console.error(`[UpdateUserRole] Error updating role for user ${userId}:`, error);
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
     // console.error("[DeleteUser] Error getting performing user for delete check:", e);
     return { success: false, message: "Could not verify performing user's permissions." };
  }

  if (!performingUser || performingUser.role?.trim().toLowerCase() !== 'admin') {
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
    // console.error(`[DeleteUser] Target user ${userId} not found:`, targetUserError);
    return { success: false, message: "User not found." };
  }

  if (targetUser.role === 'admin') {
    const { count, error: adminCountError } = await supabase
        .from('stock_sentry_users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
    if (adminCountError) {
        // console.error("[DeleteUser] Could not verify admin count:", adminCountError);
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
    // console.error(`[DeleteUser] Error deleting user ${userId}:`, deleteError);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  try {
    const currentUser = await getCurrentUser(); 
    return currentUser ? (currentUser.role?.trim().toLowerCase() as UserRole) : null;
  } catch (error) {
    // console.warn("[GetRoleForCurrentUser] Could not get current user role, likely not logged in:", error);
    return null;
  }
}

