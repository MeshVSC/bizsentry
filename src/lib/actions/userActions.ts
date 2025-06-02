
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView, GetCurrentUserResult } from "@/types/user";
import { revalidatePath } from "next/cache";
// import { cookies } from 'next/headers'; // No longer needed for getCurrentUser with mock
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
// import { cache } from 'react'; // No longer needed for getCurrentUser

const SESSION_COOKIE_NAME = 'stocksentry_custom_session'; // Kept for reference if loginUser/logoutUser are used

// Define a mock admin user that will be returned when auth is "disabled"
const MOCK_ADMIN_USER: CurrentUser = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // VALID UUID
  username: 'MockAdmin',
  role: 'admin',
};

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string } | void> {
  // In "auth disabled" mode, this function might not be hit if /login redirects.
  // If it is, we can just simulate success and redirect.
  // For now, let's assume it won't be called due to /login page redirect.
  // If direct access to this action happens, it would try to work with Supabase.
  // To fully disable, we could make it return { success: true } and redirect,
  // but the /login page redirect should cover most cases.
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;
  // const timestamp = new Date().toISOString();
  // console.log(`[LoginUser (${timestamp})] Attempting login for username: ${usernameInput}`);

  if (!usernameInput || !passwordInput) {
    // console.warn(`[LoginUser (${timestamp})] Login failed: Username or password not provided.`);
    return { success: false, message: "Username and password are required." };
  }

  const normalizedUsername = usernameInput.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', normalizedUsername)
    .single();

  if (error || !user) {
    // console.warn(`[LoginUser (${timestamp})] Login failed for username: ${normalizedUsername}. User not found or Supabase error: ${error?.message}`);
    return { success: false, message: "Invalid username or password." };
  }
  
  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") {
    //  console.error(`[LoginUser (${timestamp})] Login failed for ${normalizedUsername}: User object fetched but ID is invalid or missing.`);
     return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }

  if (user.password_text === passwordInput) {
    // console.log(`[LoginUser (${timestamp})] Password match for ${normalizedUsername}. Setting cookie.`);
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    };
    try {
      // const cookieStore = cookies(); // cookies() might not be available if not in a route handler/server component directly using it.
      // For now, this part will be bypassed if /login redirects.
      // cookieStore.set(SESSION_COOKIE_NAME, user.id, cookieOptions);
      // console.log(`[LoginUser (${timestamp})] Cookie SET: name=${SESSION_COOKIE_NAME}, value=${user.id}, options=${JSON.stringify(cookieOptions)}`);
    } catch (cookieError: any) {
      // console.error(`[LoginUser (${timestamp})] Login succeeded for ${normalizedUsername} but failed to set session cookie: ${cookieError.message}`);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard'); 
  } else {
    // console.warn(`[LoginUser (${timestamp})] Login attempt failed for username: ${normalizedUsername}. Password mismatch.`);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  // const timestamp = new Date().toISOString();
  try {
    // console.log(`[LogoutUser (${timestamp})] Attempting to delete cookie: ${SESSION_COOKIE_NAME}`);
    // cookies().delete(SESSION_COOKIE_NAME); // cookies() might not be available.
    // console.log(`[LogoutUser (${timestamp})] Cookie deleted. Revalidating path and preparing redirect.`);
    revalidatePath("/", "layout");
    return { success: true, redirectPath: "/login" }; // Login will redirect to dashboard in "auth disabled" mode.
  } catch (e: any) {
    // console.error(`[LogoutUser (${timestamp})] Logout failed: ${e.message}`);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

export const getCurrentUser = async (): Promise<GetCurrentUserResult> => {
  // In "auth disabled" mode, always return the mock admin user.
  // console.log("[GetCurrentUser DEBUG] Auth disabled - returning mock admin user.");
  return { user: MOCK_ADMIN_USER, debugMessage: "Auth disabled: Returning mock admin user." };
};


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
  // With auth disabled, authResult.user will be MOCK_ADMIN_USER
  if (!authResult.user) {
      // This case should not be hit if getCurrentUser always returns mock admin
      return { success: false, message: "Action requires authentication. " + (authResult.debugMessage || "") };
  }
  const performingUser = authResult.user;

  if (performingUser.role?.trim().toLowerCase() !== 'admin') {
      return { success: false, message: "Permission denied: Only admins can update roles." };
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
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  const authResult = await getCurrentUser(); 
  const performingUser = authResult.user; // Will be MOCK_ADMIN_USER

  if (!performingUser) {
     // This case should not be hit
    return { success: false, message: "Action requires authentication. " + (authResult.debugMessage || "") };
  }

  if (performingUser.role?.trim().toLowerCase() !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can delete users." };
  }

  if (performingUser.id === userId) {
    // This check will now compare against 'mock-admin-user-id'
    if (userId === MOCK_ADMIN_USER.id) {
        return { success: false, message: "Cannot delete the mock admin user account." };
    }
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
  const { user } = await getCurrentUser(); // Will be MOCK_ADMIN_USER
  return user ? (user.role?.trim().toLowerCase() as UserRole) : null;
}

