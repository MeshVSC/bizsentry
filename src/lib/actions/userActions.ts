
"use server";

import type { User, UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js'; // For custom table interaction

// Ensure Supabase client is initialized for custom table interactions
// These should be set in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Log detailed error but avoid throwing during initial module load if possible,
  // as this code is also bundled for client-side use by some components.
  // Critical actions will fail if these are not set.
  console.error("Supabase URL or Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env");
}
// Create a Supabase client instance for interacting with your custom tables.
// RLS policies on your 'stock_sentry_users' table will govern access.
const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

// --- Custom User Authentication and Management Actions ---

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

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .eq('username', usernameInput.toLowerCase()) // Query by username
    .single();

  if (error || !user) {
    console.error("Login error or user not found:", error);
    return { success: false, message: "Invalid username or password." };
  }

  // DIRECT PASSWORD COMPARISON - NOT SECURE FOR PRODUCTION
  if (user.password_text === passwordInput) {
    cookies().set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    revalidatePath("/", "layout"); // Revalidate to ensure layout picks up session
    redirect('/dashboard'); 
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
     console.error("getCurrentUser: Supabase client not configured on server.");
     return null;
  }

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role') // Only select necessary fields for CurrentUser
    .eq('id', userId)
    .single();

  if (error || !user) {
    // Clear cookie if user not found in DB for this ID
    if (error) console.error("Error fetching current user:", error);
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  return user as CurrentUser;
}

// --- User Role Management (for stock_sentry_users table) ---

export async function getUsers(): Promise<UserView[]> {
  const performingUser = await getCurrentUser();
  if (!performingUser || performingUser.role !== 'admin') {
    console.warn("Attempt to fetch users by non-admin or unauthenticated user.");
    return [];
  }
   if (!supabaseUrl || !supabaseAnonKey) {
     console.error("getUsers: Supabase client not configured on server.");
     return [];
  }

  const { data, error } = await supabase
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
  if (data.password.length < 5 || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password) ) {
       return { success: false, message: "Password does not meet requirements (min 5 chars, 1 uppercase, 1 number)." };
  }
   if (!supabaseUrl || !supabaseAnonKey) {
     return { success: false, message: "Supabase client not configured on server." };
  }

  const { data: existingUser, error: selectError } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .eq('username', data.username.toLowerCase())
    .single();

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
      username: data.username.toLowerCase(),
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
    .select('role, username') // Also select username for messages
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


// Function to get app-specific role for a logged-in user (using custom table)
export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  const currentUser = await getCurrentUser(); // This now checks our custom session cookie & table
  return currentUser ? currentUser.role : null;
}

// Initial seed data - this is only used if your Supabase table is empty
// For a real app, initial admin setup would be done differently (e.g. seed script or first signup)
// This is NOT automatically inserted into Supabase by this code.
// You would run INSERT statements in Supabase SQL editor for the very first users.
const initialUsersSeed: Omit<User, 'id' | 'created_at' | 'updated_at'>[] = [
  { username: "admin", password_text: "adminpassword", role: "admin" },
  { username: "manager_user", password_text: "managerpassword", role: "manager" },
  { username: "viewer", password_text: "viewerpassword", role: "viewer" },
];

// NOTE: The 'globalThis._usersStore' logic has been removed as user data is now in Supabase 'stock_sentry_users' table.
// The 'initialUsersSeed' above is for reference and would be used for initial Supabase table population.
