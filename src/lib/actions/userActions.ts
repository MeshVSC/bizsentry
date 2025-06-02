
"use server";

import type { User, UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Module-level Supabase client - still useful for actions not in critical auth path if preferred
const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;

  if (!usernameInput || !passwordInput) {
    return { success: false, message: "Username and password are required." };
  }
  if (!supabaseUrl || !supabaseAnonKey) {
     return { success: false, message: "Supabase client not configured on server." };
  }

  // Use module-level client for login or a local one
  const loginSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: user, error } = await loginSupabaseClient
    .from('stock_sentry_users')
    .select('*')
    .ilike('username', usernameInput) // Case-insensitive username check
    .single();

  if (error || !user) {
    console.error("Login error or user not found:", error ? error.message : "User not found for username: " + usernameInput);
    return { success: false, message: "Invalid username or password." };
  }

  // IMPORTANT SECURITY WARNING: Plaintext password comparison. Not for production.
  if (user.password_text === passwordInput) {
    cookies().set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
      sameSite: 'lax',
    });
    revalidatePath("/", "layout"); 
    redirect('/dashboard'); 
    // The redirect means the { success: true } part is technically unreachable client-side
    // but good to have for completeness if redirect was conditional.
    // return { success: true }; 
  } else {
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser() {
  cookies().delete(SESSION_COOKIE_NAME);
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }
  if (!supabaseUrl || !supabaseAnonKey) {
     console.error("getCurrentUser: Supabase client not configured on server. URL or Key missing.");
     return null;
  }

  // Create a new Supabase client instance specifically for this function call
  const localSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  const { data: user, error } = await localSupabaseClient
    .from('stock_sentry_users')
    .select('id, username, role') 
    .eq('id', userId)
    .single();

  if (error || !user) {
    if (error) {
      console.error(`getCurrentUser: Error fetching user for ID ${userId} from Supabase:`, error.message);
    }
    // If user not found or error, clear the potentially stale cookie
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  return user as CurrentUser;
}

export async function getUsers(): Promise<UserView[]> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role !== 'admin') {
    // console.warn("Attempt to fetch users by non-admin or unauthenticated user.");
    return [];
  }
   if (!supabaseUrl || !supabaseAnonKey) {
     console.error("getUsers: Supabase client not configured on server.");
     return [];
  }

  const { data, error } = await supabase // Can use module-level client here
    .from('stock_sentry_users')
    .select('id, username, role, created_at, updated_at')
    .order('username', { ascending: true });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return (data as UserView[]) || [];
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can add users." };
  }

  if (!data.username || !data.password || !data.role) {
    return { success: false, message: "Username, password, and role are required." };
  }
  // Password requirements check (moved from AddUserForm for server-side validation)
  if (data.password.length < 5 || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password) ) {
       return { success: false, message: "Password does not meet requirements (min 5 chars, 1 uppercase, 1 number)." };
  }
   if (!supabaseUrl || !supabaseAnonKey) {
     return { success: false, message: "Supabase client not configured on server." };
  }

  const normalizedUsername = data.username.toLowerCase(); // Store usernames in lowercase
  const { data: existingUser, error: selectError } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .eq('username', normalizedUsername) // Check against lowercase username
    .single();

  // PGRST116 means "Searched for a single row, but 0 rows were found" which is what we want (user doesn't exist)
  if (selectError && selectError.code !== 'PGRST116') { 
      console.error("Error checking existing user:", selectError);
      return { success: false, message: `Error checking existing user: ${selectError.message}` };
  }
  if (existingUser) {
    return { success: false, message: `User with username "${data.username}" already exists.` };
  }

  const { data: newUser, error: insertError } = await supabase
    .from('stock_sentry_users')
    .insert({
      username: normalizedUsername, // Save lowercase username
      password_text: data.password, // Storing plaintext password - NOT SECURE
      role: data.role,
    })
    .select('id, username, role, created_at, updated_at')
    .single();

  if (insertError) {
    console.error("Error adding user:", insertError);
    return { success: false, message: `Failed to add user: ${insertError.message}` };
  }

  if (newUser) {
    revalidatePath("/settings/users", "page");
    return { success: true, message: `User "${newUser.username}" added successfully.`, user: newUser as UserView };
  }
  return { success: false, message: "Failed to add user for an unknown reason."};
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can update roles." };
  }
   if (!supabaseUrl || !supabaseAnonKey) {
     return { success: false, message: "Supabase client not configured on server." };
  }

  const { data: targetUserForRoleCheck, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('role, username') 
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUserForRoleCheck) {
    return { success: false, message: "Target user not found." };
  }

  // Prevent admin from demoting the last admin
  if (targetUserForRoleCheck.role === 'admin' && newRole !== 'admin') {
    const { count, error: adminCountError } = await supabase
      .from('stock_sentry_users')
      .select('id', { count: 'exact', head: true }) // Efficiently count
      .eq('role', 'admin');
    
    if (adminCountError) {
      console.error("Error counting admins:", adminCountError);
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
    console.error("Error updating user role:", error);
    return { success: false, message: `Failed to update role: ${error.message}` };
  }

  if (updatedUser) {
    revalidatePath("/settings/users", "page");
    // If the admin updates their own role, update the session cookie role?
    // Current `getCurrentUser` re-fetches, so maybe not strictly needed unless for immediate UI post-action.
    // For now, we rely on revalidation and subsequent `getCurrentUser` calls.
    return { success: true, message: `User "${updatedUser.username}" role updated to ${newRole}.`, user: updatedUser as UserView };
  }
   return { success: false, message: "Failed to update role for an unknown reason."};
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can delete users." };
  }
  if (performingUser.id === userId) {
    return { success: false, message: "Cannot delete your own account." };
  }
   if (!supabaseUrl || !supabaseAnonKey) {
     return { success: false, message: "Supabase client not configured on server." };
  }

  // Fetch the user to be deleted to check their role (e.g., if last admin)
  const { data: targetUser, error: targetUserError } = await supabase
    .from('stock_sentry_users')
    .select('username, role')
    .eq('id', userId)
    .single();

  if (targetUserError || !targetUser) {
    return { success: false, message: "User not found." };
  }

  // Prevent deletion of the last admin
  if (targetUser.role === 'admin') {
    const { count, error: adminCountError } = await supabase
        .from('stock_sentry_users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
    if (adminCountError) {
        console.error("Error counting admins for delete:", adminCountError);
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
    console.error("Error deleting user:", deleteError);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}

// Helper to get just the role for quick checks, not currently used by settings pages directly
export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  const currentUser = await getCurrentUser(); 
  return currentUser ? currentUser.role : null;
}

// Initial seed data for the stock_sentry_users table.
// This should ideally be run once via Supabase SQL editor or a seeding script.
// Keeping it here for reference, but userActions.ts doesn't automatically seed.
const initialUsersSeed: Omit<User, 'id' | 'created_at' | 'updated_at'>[] = [
  { username: "admin", password_text: "adminpassword", role: "admin" },
  { username: "manager", password_text: "managerpassword", role: "manager" },
  { username: "viewer", password_text: "viewerpassword", role: "viewer" },
];
