
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
// import { cache } from 'react'; // React.cache removed for this test

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
    return { success: false, message: "Invalid username or password." };
  }

  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") {
    return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }

  if (user.password_text === passwordInput) {
    try {
      cookies().set(SESSION_COOKIE_NAME, user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: true, 
        httpOnly: true, 
      });
    } catch (cookieError: any) {
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout'); 
    redirect('/dashboard'); 
  } else {
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
    revalidatePath("/", "layout");
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

// React.cache wrapper removed for this diagnostic step
export async function getCurrentUser(): Promise<CurrentUser | null> {
  let userId: string | undefined;
  let rawCookie: ReturnType<typeof cookies>['get'] | undefined;

  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
  } catch (cookieError: any) {
    // This catch might be too broad if cookies() itself throws for reasons other than not finding a cookie.
    // console.error("[GetCurrentUser] Error when trying to access cookies store:", cookieError.message);
    throw new Error(`SESSION_COOKIE_ACCESS_ERROR: ${cookieError.message}`);
  }

  if (!rawCookie) {
    // console.log("[GetCurrentUser] Cookie object not found.");
    throw new Error("SESSION_COOKIE_NOT_FOUND_OBJECT");
  }
  
  userId = rawCookie.value;
  if (!userId || userId.trim() === "") {
    // console.log("[GetCurrentUser] Cookie found, but value (userId) is empty or undefined.");
    throw new Error("SESSION_COOKIE_VALUE_EMPTY");
  }

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // "Searched for a single row, but 0 rows were found"
      // console.log(`[GetCurrentUser] Supabase: User not found for ID: ${userId}`);
      throw new Error(`SUPABASE_USER_NOT_FOUND_FOR_ID: ${userId}`);
    }
    // console.error(`[GetCurrentUser] Supabase query error: ${error.message} (Code: ${error.code})`);
    throw new Error(`SUPABASE_QUERY_ERROR: ${error.message} (Code: ${error.code})`);
  }

  if (!user) {
    // This case should ideally be caught by error.code === 'PGRST116'
    // console.log(`[GetCurrentUser] Supabase: User not found for ID ${userId}, despite no error.`);
    throw new Error(`SUPABASE_USER_NOT_FOUND_DESPITE_NO_ERROR_FOR_ID: ${userId}`);
  }
  return user as CurrentUser;
};


export async function getUsers(): Promise<UserView[]> {
  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
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
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  let performingUser: CurrentUser | null = null;
  try {
    performingUser = await getCurrentUser(); // Call without React.cache
  } catch (e) {
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
  try {
    const currentUser = await getCurrentUser(); // Call without React.cache
    return currentUser ? (currentUser.role?.trim().toLowerCase() as UserRole) : null;
  } catch (error) {
    return null;
  }
}

