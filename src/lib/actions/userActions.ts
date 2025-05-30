
"use server";

import type { User, UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client'; // For interacting with the custom table

const SESSION_COOKIE_NAME = 'stocksentry_custom_session';

// --- Custom User Authentication and Management Actions ---

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  const username = formData.get("email") as string; // Form field is 'email' but maps to 'username'
  const passwordInput = formData.get("password") as string;

  if (!username || !passwordInput) {
    return { success: false, message: "Email and password are required." };
  }

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('*')
    .eq('username', username.toLowerCase())
    .single();

  if (error || !user) {
    return { success: false, message: "Invalid email or password." };
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
    // Revalidate layout to ensure currentUser is picked up
    revalidatePath("/", "layout");
    redirect('/dashboard'); // Redirect from server action
    // Explicit return for type consistency, though redirect will prevent it from being used.
    // return { success: true }; 
  } else {
    return { success: false, message: "Invalid email or password." };
  }
}

export async function logoutUser() {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Expire immediately
    path: '/',
    sameSite: 'lax',
  });
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const { data: user, error } = await supabase
    .from('stock_sentry_users')
    .select('id, username, role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    // Clear cookie if user not found in DB for this ID
    cookies().set(SESSION_COOKIE_NAME, '', { maxAge: -1, path: '/' });
    return null;
  }

  return user as CurrentUser;
}

// --- User Role Management (for stock_sentry_users table) ---

export async function getUsers(): Promise<UserView[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    console.warn("Attempt to fetch users by non-admin or unauthenticated user.");
    return []; // Or throw an error
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
    return { success: false, message: "Email, password, and role are required." };
  }
  // Basic password validation (can be enhanced)
  if (data.password.length < 5) {
       return { success: false, message: "Password must be at least 5 characters." };
  }


  // Check if username (email) already exists
  const { data: existingUser, error: selectError } = await supabase
    .from('stock_sentry_users')
    .select('id')
    .eq('username', data.username.toLowerCase())
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116: 0 rows
      console.error("Error checking existing user:", selectError);
      return { success: false, message: `Error checking existing user: ${selectError.message}` };
  }
  if (existingUser) {
    return { success: false, message: `User with email "${data.username}" already exists.` };
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

  // Prevent admin from demoting the last admin (or themselves if last admin)
  if (newRole !== 'admin') {
    const { data: targetUser, error: targetUserError } = await supabase
      .from('stock_sentry_users')
      .select('role')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUser) {
      return { success: false, message: "Target user not found." };
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
        return { success: false, message: "Cannot remove the last administrator's role." };
      }
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
    // If admin updates their own role to non-admin, this won't auto-logout them
    // until next page load where getCurrentUser re-evaluates.
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
    console.error("Error deleting user:", deleteError);
    return { success: false, message: `Failed to delete user: ${deleteError.message}` };
  }

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${targetUser.username}" deleted successfully.` };
}


// Function to get app-specific role for a logged-in user (using custom table)
export async function getRoleForCurrentUser(): Promise<UserRole | null> {
  const currentUser = await getCurrentUser();
  return currentUser ? currentUser.role : null;
}
