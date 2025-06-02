
"use server";

import type { UserRole, CurrentUser, UserFormInput, UserView, GetCurrentUserResult } from "@/types/user";
import { revalidatePath } from "next/cache";
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';

// This MOCK_ADMIN_USER is now only for reference if we re-enable auth with a mock.
// It's NOT actively returned by getCurrentUser when auth is "fully paused".
const MOCK_ADMIN_USER_FOR_REFERENCE_ONLY: CurrentUser = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // VALID UUID
  username: 'MockAdmin',
  role: 'admin',
};

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
    // Cookies are HttpOnly, so client-side JS can't access them directly.
    // Server actions and route handlers can use cookies().set(...)
    // For now, redirect happens, actual cookie setting logic might need to be in API route if not server action.
    // This part is less critical while auth is paused.
    revalidatePath('/', 'layout');
    redirect('/dashboard'); 
  } else {
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string; redirectPath?: string }> {
  try {
    // Logic to clear HttpOnly cookie would typically go here if set by server action/route
    revalidatePath("/", "layout");
    return { success: true, redirectPath: "/login" };
  } catch (e: any) {
    return { success: false, message: `Logout failed due to a server error: ${e.message}` };
  }
}

export const getCurrentUser = async (): Promise<GetCurrentUserResult> => {
  // AUTH IS PAUSED: Always return null user.
  // This ensures dependent actions (like itemActions) operate without a user context.
  // console.log("[GetCurrentUser DEBUG] Auth fully paused by admin request - returning { user: null }.");
  return { user: null, debugMessage: "Authentication is currently paused by administrative request." };
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
  // Adding users is still possible but items created won't be linked if auth is paused for items.
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
  // Role updates still make sense in terms of managing user data, even if item linking is paused.
  const authResult = await getCurrentUser(); 
  // In "paused auth", authResult.user will be null.
  // This means role updates by a "non-existent" admin might not be meaningful,
  // but we'll keep the admin check for if/when auth is re-enabled.
  // For now, to allow user management page to function without breaking if it checks admin role:
  const performingUserRole = 'admin'; // Assume admin for this action if auth is paused.

  if (performingUserRole !== 'admin') {
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
  const performingUser = authResult.user;
  const performingUserRole = 'admin'; // Assume admin for this action if auth is paused.

  if (performingUserRole !== 'admin') {
    return { success: false, message: "Permission denied: Only admins can delete users." };
  }

  // if (performingUser && performingUser.id === userId) { // This check is complex if performingUser is null
  //   return { success: false, message: "Cannot delete your own account." };
  // }
  // If deleting the MOCK_ADMIN_USER_FOR_REFERENCE_ONLY id, prevent it.
  if (userId === MOCK_ADMIN_USER_FOR_REFERENCE_ONLY.id) {
      return { success: false, message: "Cannot delete this protected system user account." };
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
  // Since auth is paused, there's no "current user role" in the traditional sense.
  // Components relying on this might need to adapt or be aware auth is paused.
  // Returning null reflects that no specific user is authenticated.
  return null;
}
