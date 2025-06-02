
"use server";

import type { User, UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client'; 
import { redirect } from 'next/navigation'; 
import { cache } from 'react'; // Import React cache

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

// Modified to redirect internally on success
export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string } | void> { // Return void on success due to redirect
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;

  // console.log(`[LoginAttempt] Username input: ${usernameInput}`);

  if (!usernameInput || !passwordInput) {
    // console.log("[LoginFailed] Username or password not provided.");
    return { success: false, message: "Username and password are required." };
  }

  const normalizedUsername = usernameInput.trim().toLowerCase();
  // console.log(`[LoginAttempt] Normalized username: ${normalizedUsername}`);

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', normalizedUsername)
    .single();

  if (error || !user) {
    // console.error(`[LoginFailed] Supabase error or user not found for username "${normalizedUsername}":`, error ? error.message : "User not found.");
    return { success: false, message: "Invalid username or password." };
  }

  // console.log(`[LoginAttempt] User found in DB: ID ${user.id}, Username: ${user.username}, Role: ${user.role}`);

  if (!user.id || typeof user.id !== 'string' || user.id.trim() === "") { 
    // console.error("[LoginFailed] Critical: User object fetched from database is missing a valid ID string. User data:", JSON.stringify(user));
    return { success: false, message: "Login failed due to a server data integrity issue (user ID invalid). Please contact support." };
  }
  // console.log(`[LoginSuccess] User ID for cookie: ${user.id}`);


  if (user.password_text === passwordInput) {
    // console.log(`[LoginSuccess] Passwords match for user ID ${user.id}. Attempting to set cookie.`);
    
    try {
      cookies().set(SESSION_COOKIE_NAME, user.id, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        sameSite: 'lax', 
      });
      // console.log(`[LoginSuccess] Cookie set for user ID ${user.id}.`);
    } catch (cookieError: any) {
      // console.error(`[LoginFailed] Error setting cookie for user ID ${user.id}:`, cookieError.message);
      return { success: false, message: "Login succeeded but failed to set session. Please try again." };
    }
    
    revalidatePath('/', 'layout'); 
    // console.log("[LoginSuccess] Path revalidated. Redirecting to /dashboard from server action...");
    redirect('/dashboard'); 
  } else {
    // console.log(`[LoginFailed] Passwords do not match for user ID ${user.id}.`);
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    // console.log("[LogoutAttempt] Deleting session cookie.");
    cookies().delete(SESSION_COOKIE_NAME);
    revalidatePath("/", "layout"); 
    // console.log("[LogoutSuccess] Cookie deleted, path revalidated.");
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    // console.error("[LogoutFailed] Error during logout:", e);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  let userId;
  let rawCookie;
  try {
    rawCookie = cookies().get(SESSION_COOKIE_NAME);
    // console.log(`[GetCurrentUser] Raw cookie object for ${SESSION_COOKIE_NAME}:`, JSON.stringify(rawCookie || null));
    userId = rawCookie?.value;
  } catch (cookieError: any) {
    // console.error(`[GetCurrentUser] Error reading cookie: ${cookieError.message}`);
    throw new Error(`SESSION_COOKIE_READ_ERROR: ${cookieError.message}`);
  }
  
  // console.log(`[GetCurrentUser] Attempting to get user. Cookie UserID: ${userId || 'Not set/found'}`);

  if (!userId || userId.trim() === "") {
    // console.log("[GetCurrentUser] No userId found in cookie or cookie itself not found/empty.");
    throw new Error("SESSION_COOKIE_NOT_FOUND_OR_EMPTY");
  }

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role') 
    .eq('id', userId)
    .single();
  
  // console.log(`[GetCurrentUser] Supabase query result for ID ${userId}:`, { data: JSON.stringify(user || null), error: error ? JSON.stringify(error) : null });

  if (error) {
    // console.error(`[GetCurrentUser] Error fetching user for ID "${userId}" from Supabase:`, error.message);
    if (error.code === 'PGRST116') { 
      throw new Error(`SUPABASE_USER_NOT_FOUND_FOR_ID: ${userId}`);
    }
    throw new Error(`SUPABASE_QUERY_ERROR: ${error.message} (Code: ${error.code})`);
  }
  
  if (!user) {
    // console.log(`[GetCurrentUser] No user found in database for ID "${userId}". Cookie might be stale or RLS policy issue.`);
    throw new Error(`SUPABASE_USER_NOT_FOUND_DESPITE_NO_ERROR_FOR_ID: ${userId}`);
  }

  // console.log(`[GetCurrentUser] User found: ID ${user.id}, Username: ${user.username}, Role: ${user.role}`);
  return user as CurrentUser;
});

export async function getUsers(): Promise<UserView[]> {
  // console.log("[GetUsers] Attempting to fetch all users.");
  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at') 
    .order('username', { ascending: true });

  if (error) {
    // console.error("[GetUsers] Error fetching users from Supabase:", error);
    return [];
  }
  // console.log(`[GetUsers] Fetched ${data?.length || 0} users from Supabase.`);
  return (data as UserView[]) || [];
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  // console.log("[AddUser] Attempting to add new user:", { username: data.username, role: data.role });
  
  if (!data.username || !data.password || !data.role) {
    // console.warn("[AddUser] Validation failed: Username, password, and role are required.");
    return { success: false, message: "Username, password, and role are required." };
  }
   if (data.password.length < 5 || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password) ) {
    // console.warn("[AddUser] Validation failed: Password does not meet requirements.");
    return { success: false, message: "Password does not meet requirements (min 5 chars, 1 uppercase, 1 number)." };
  }

  const normalizedUsername = data.username.trim().toLowerCase(); 
  // console.log("[AddUser] Checking for existing user with normalized username:", normalizedUsername);
  const { data: existingUser, error: selectError } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .ilike('username', normalizedUsername) 
    .single();

  if (selectError && selectError.code !== 'PGRST116') { 
      // console.error("[AddUser] Error checking existing user in Supabase:", selectError);
      return { success: false, message: `Error checking existing user: ${selectError.message}` };
  }
  if (existingUser) {
    // console.warn(`[AddUser] User with username "${data.username}" already exists.`);
    return { success: false, message: `User with username "${data.username}" already exists.` };
  }

  // console.log("[AddUser] Inserting new user into Supabase.");
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
    // console.error("[AddUser] Error inserting user into Supabase:", insertError);
    return { success: false, message: `Failed to add user: ${insertError.message}` };
  }

  if (newUser) {
    revalidatePath("/settings/users", "page"); 
    // console.log(`[AddUser] User "${newUser.username}" added successfully.`);
    return { success: true, message: `User "${newUser.username}" added successfully.`, user: newUser as UserView };
  }
  // console.error("[AddUser] Failed to add user for an unknown reason (newUser data is null).");
  return { success: false, message: "Failed to add user for an unknown reason."};
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  // console.log(`[UpdateUserRole] Attempting to update role for user ID ${userId} to ${newRole}.`);
  
  // console.log(`[UpdateUserRole] Fetching target user ID ${userId} for role check.`);
  const { data: targetUserForRoleCheck, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('role, username') 
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUserForRoleCheck) {
    // console.warn(`[UpdateUserRole] Target user ID ${userId} not found or error fetching.`);
    return { success: false, message: "Target user not found." };
  }

  if (targetUserForRoleCheck.role === 'admin' && newRole !== 'admin') {
    // console.log("[UpdateUserRole] Target user is admin, new role is not admin. Counting admins.");
    const { count, error: adminCountError } = await supabase
      .from('stock_sentry_users')
      .select('id', { count: 'exact', head: true }) 
      .eq('role', 'admin');
    
    if (adminCountError) {
      // console.error("[UpdateUserRole] Error counting admins in Supabase:", adminCountError);
      return { success: false, message: "Could not verify admin count."};
    }
    // console.log(`[UpdateUserRole] Current admin count: ${count}`);
    if (count !== null && count <= 1) {
      // console.warn("[UpdateUserRole] Cannot remove the last administrator's role.");
      return { success: false, message: "Cannot remove the last administrator's role." };
    }
  }
  
  // console.log(`[UpdateUserRole] Updating role for user ID ${userId} in Supabase.`);
  const { data: updatedUser, error } = await supabase
    .from('stock_sentry_users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, username, role, created_at, updated_at')
    .single();

  if (error) {
    // console.error(`[UpdateUserRole] Error updating user role in Supabase for user ID ${userId}:`, error);
    return { success: false, message: `Failed to update role: ${error.message}` };
  }

  if (updatedUser) {
    revalidatePath("/settings/users", "page");
    // console.log(`[UpdateUserRole] User "${updatedUser.username}" role updated to ${newRole}.`);
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
  // console.error(`[UpdateUserRole] Failed to update role for user ID ${userId} for an unknown reason (updatedUser is null).`);
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  // console.log(`[DeleteUser] Attempting to delete user ID ${userId}.`);
  const performingUser = await getCurrentUser(); 
  
  if (!performingUser || performingUser.role?.trim().toLowerCase() !== 'admin') {
    // console.warn("[DeleteUser] Permission denied: Only admins can delete users. Current user role:", performingUser?.role);
    return { success: false, message: "Permission denied: Only admins can delete users." };
  }
  
  if (performingUser.id === userId) {
    // console.warn("[DeleteUser] Admin attempting to delete their own account.");
    return { success: false, message: "Cannot delete your own account." };
  }

  // console.log(`[DeleteUser] Fetching target user ID ${userId} for pre-delete checks.`);
  const { data: targetUser, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('username, role')
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUser) {
    // console.warn(`[DeleteUser] Target user ID ${userId} not found or error fetching.`);
    return { success: false, message: "User not found." };
  }

  if (targetUser.role === 'admin') {
    // console.log("[DeleteUser] Target user is admin. Counting admins.");
    const { count, error: adminCountError } = await supabase
        .from('stock_sentry_users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
    if (adminCountError) {
        // console.error("[DeleteUser] Error counting admins in Supabase for delete:", adminCountError);
        return { success: false, message: "Could not verify admin count."};
    }
    // console.log(`[DeleteUser] Current admin count: ${count}.`);
    if (count !== null && count <= 1) {
        // console.warn("[DeleteUser] Cannot delete the last administrator.");
        return { success: false, message: "Cannot delete the last administrator." };
    }
  }

  // console.log(`[DeleteUser] Deleting user ID ${userId} from Supabase.`);
  const { error: deleteError } = await supabase
    .from('stock_sentry_users')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    // console.error(`[DeleteUser] Error deleting user ID ${userId} from Supabase:`, deleteError);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  // console.log(`[DeleteUser] User "${targetUser.username}" deleted successfully.`);
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  // console.log("[GetRoleForCurrentUser] Fetching current user to determine role.");
  const currentUser = await getCurrentUser();  
  const role = currentUser ? (currentUser.role?.trim().toLowerCase() as UserRole) : null;
  // console.log(`[GetRoleForCurrentUser] Role determined: ${role}`);
  return role;
}
