
"use server";

import type { User, UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client'; // Use the shared client

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;

  if (!usernameInput || !passwordInput) {
    return { success: false, message: "Username and password are required." };
  }

  const normalizedUsername = usernameInput.trim().toLowerCase();
  
  // console.log(`[LoginAttempt] Username: ${normalizedUsername}`);

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*') 
    .ilike('username', normalizedUsername) 
    .single();

  if (error || !user) {
    // console.error(`[LoginFailed] Error or user not found for username "${normalizedUsername}":`, error ? error.message : "User not found.");
    return { success: false, message: "Invalid username or password." };
  }

  // Defensive check: Ensure user.id exists before using it
  if (!user.id) {
    console.error("[LoginFailed] Critical: User object fetched from database is missing an ID. User data:", user);
    return { success: false, message: "Login failed due to a server data integrity issue (user ID missing). Please contact support." };
  }

  // console.log(`[LoginAttempt] User found in DB: ID ${user.id}, Username: ${user.username}`);

  // Direct password comparison - INSECURE FOR PRODUCTION
  if (user.password_text === passwordInput) {
    // console.log(`[LoginSuccess] Passwords match for user ID ${user.id}. Setting cookie.`);
    
    // Explicitly revalidate layout before setting cookie and returning.
    revalidatePath('/', 'layout'); 

    cookies().set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
      sameSite: 'lax',
    });
    // console.log(`[LoginSuccess] Cookie set for user ID ${user.id}.`);
    return { success: true, redirectPath: '/dashboard' };
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
    console.error("[LogoutFailed] Error during logout:", e);
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = cookies().get(SESSION_COOKIE_NAME)?.value;
  // console.log(`[GetCurrentUser] Attempting to get user. Cookie UserID: ${userId || 'Not set/found'}`);

  if (!userId) {
    // console.log("[GetCurrentUser] No userId found in cookie.");
    return null;
  }

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role') 
    .eq('id', userId)
    .single();

  if (error || !user) {
    if (error && error.code !== 'PGRST116') { // PGRST116 means "Searched for a single row, but 0 rows were found"
      console.error(`[GetCurrentUser] Error fetching user for ID "${userId}" from Supabase:`, error.message);
    } else if (!user) {
      // console.log(`[GetCurrentUser] No user found in database for ID "${userId}". Cookie might be stale.`);
    }
    return null;
  }
  // console.log(`[GetCurrentUser] User found: ID ${user.id}, Username: ${user.username}, Role: ${user.role}`);
  return user as CurrentUser;
}

export async function getUsers(): Promise<UserView[]> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role?.trim().toLowerCase() !== 'admin') {
    console.warn("[GetUsers] Access denied. Current user is not an admin or not found.");
    return [];
  }

  const { data, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
    console.error("[GetUsers] Error fetching users:", error);
    return [];
  }
  // console.log(`[GetUsers] Fetched ${data?.length || 0} users.`);
  return (data as UserView[]) || [];
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role?.trim().toLowerCase() !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can add users." };
  }

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
      console.error("[AddUser] Error checking existing user:", selectError);
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
    console.error("[AddUser] Error adding user:", insertError);
    return { success: false, message: `Failed to add user: ${insertError.message}` };
  }

  if (newUser) {
    revalidatePath("/settings/users", "page");
    // console.log(`[AddUser] User "${newUser.username}" added successfully.`);
    return { success: true, message: `User "${newUser.username}" added successfully.`, user: newUser as UserView };
  }
  return { success: false, message: "Failed to add user for an unknown reason."};
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role?.trim().toLowerCase() !== 'admin') {
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
      console.error("[UpdateUserRole] Error counting admins:", adminCountError);
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
    console.error("[UpdateUserRole] Error updating user role:", error);
    return { success: false, message: `Failed to update role: ${error.message}` };
  }

  if (updatedUser) {
    revalidatePath("/settings/users", "page");
    // console.log(`[UpdateUserRole] User "${updatedUser.username}" role updated to ${newRole}.`);
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  const performingUser = await getCurrentUser();
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
        console.error("[DeleteUser] Error counting admins for delete:", adminCountError);
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
    console.error("[DeleteUser] Error deleting user:", deleteError);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  // console.log(`[DeleteUser] User "${targetUser.username}" deleted successfully.`);
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  const currentUser = await getCurrentUser(); 
  return currentUser ? (currentUser.role?.trim().toLowerCase() as UserRole) : null;
}

// Example initial users for manual seeding if table is empty.
// These would typically be added directly via Supabase Studio for first-time setup.
/*
const initialUsersSeed: Omit<User, 'id' | 'created_at' | 'updated_at'>[] = [
  { username: "admin", password_text: "adminpassword", role: "admin" },
  { username: "manager_user", password_text: "managerpassword", role: "manager" },
  { username: "viewer", password_text: "viewerpassword", role: "viewer" },
];
*/
    
