
"use server";

import type { User, UserRole, UserFormInput, UserView } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

// --- IMPORTANT ---
// The user management functions (getUsers, addUser, updateUserRole, deleteUser)
// now manage an IN-MEMORY list of users and roles (globalThis._usersStore)
// which is SEPARATE from Supabase authentication.
// Users logging in via Supabase are authenticated by Supabase.
// Their roles for THIS APP would ideally be managed by mapping Supabase user IDs/emails
// to roles defined in this _usersStore or a dedicated roles table in your Supabase DB.
// For this interim step, the "User Management" page in settings will edit _usersStore,
// but it won't directly affect Supabase-authenticated users' roles without further integration.
// --- IMPORTANT ---

const initialUsersSeed: User[] = [
  { id: "1", username: "admin@example.com", password: "adminpassword", role: "admin" },
  { id: "2", username: "viewer@example.com", password: "viewerpassword", role: "viewer" },
  { id: "3", username: "manager@example.com", password: "managerpassword", role: "manager" },
];

function ensureUsersStoreInitialized() {
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
}

// No-op login/logout/getCurrentUser as Supabase handles this client-side.
// These server actions are for the in-memory prototype and cookie management.

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  ensureUsersStoreInitialized();
  const username = formData.get("email") as string; // Expecting email from form
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const users: User[] = globalThis._usersStore || [];
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (user) {
    cookies().set('stocksentry_session_userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    // No longer revalidating path here, client-side router.refresh() handles it
    // revalidatePath("/", "layout"); // Removed
    redirect('/dashboard'); // Redirect from server action
    // return { success: true }; // Redirect makes this unreachable
  } else {
    return { success: false, message: "Invalid email or password." };
  }
}

export async function logoutUser() {
  cookies().set('stocksentry_session_userId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
  redirect("/login");
}

export async function getCurrentUser(): Promise<UserView | null> {
  ensureUsersStoreInitialized();
  const userId = cookies().get('stocksentry_session_userId')?.value;

  if (!userId) {
    return null;
  }

  const users: User[] = globalThis._usersStore || [];
  const user = users.find((u) => u.id === userId);

  if (user) {
    const { password, ...userView } = user;
    return userView;
  }
  return null;
}

export async function getUsers(): Promise<UserView[]> {
  ensureUsersStoreInitialized();
  await new Promise(resolve => setTimeout(resolve, 50));
  const users: User[] = globalThis._usersStore || [];
  // Ensure password is not returned
  return users.map(({ password, ...userView }) => userView);
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  ensureUsersStoreInitialized();
  const users: User[] = globalThis._usersStore || [];

  if (!data.username || !data.password || !data.role) {
    return { success: false, message: "Email, password, and role are required." };
  }
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { success: false, message: `User with email "${data.username}" already exists in local store.` };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username: data.username, // This should ideally be an email
    password: data.password, // Storing plaintext for prototype simplicity
    role: data.role,
  };
  users.push(newUser);
  globalThis._usersStore = users;

  revalidatePath("/settings/users", "page");
  const { password, ...userView } = newUser;
  return { success: true, message: `User "${newUser.username}" added to local store. Note: This does NOT create a Supabase user.`, user: userView };
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  ensureUsersStoreInitialized();
  const users: User[] = globalThis._usersStore || [];
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found in local store." };
  }
  
  const tempCurrentUser = await getCurrentUser(); // This uses the cookie to get current user context
  if (!tempCurrentUser || tempCurrentUser.role !== 'admin') {
      return { success: false, message: "Permission denied to change roles." };
  }

  if (users[userIndex].role === 'admin' && newRole !== 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, message: "Cannot remove the last administrator's role from local store." };
    }
  }
  
  users[userIndex].role = newRole;
  globalThis._usersStore = users;

  revalidatePath("/settings/users", "page");
  
  // If the updated user is the currently logged-in user, their session cookie is still valid
  // but their role info fetched by getCurrentUser would reflect the change on next call.

  const { password, ...userView } = users[userIndex];
  return { success: true, message: `User "${userView.username}" role updated to ${newRole} in local store.`, user: userView };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  ensureUsersStoreInitialized();
  let users: User[] = globalThis._usersStore || [];
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found in local store." };
  }

  const tempCurrentUser = await getCurrentUser();
  if (!tempCurrentUser || tempCurrentUser.role !== 'admin') {
      return { success: false, message: "Permission denied to delete users." };
  }
  if (tempCurrentUser && tempCurrentUser.id === userId) {
    return { success: false, message: "Cannot delete the currently logged-in user." };
  }
  
  if (users[userIndex].role === 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
        return { success: false, message: "Cannot delete the last administrator from local store." };
    }
  }

  const deletedUsername = users[userIndex].username;
  globalThis._usersStore = users.filter(u => u.id !== userId);

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${deletedUsername}" deleted from local store.` };
}


// Function to get app-specific role for a Supabase authenticated user
// This is a placeholder for how you might map Supabase users to your internal roles
// For now, this doesn't directly integrate with Supabase users but uses the local store's getCurrentUser.
export async function getRoleForSupabaseUser(supabaseEmail: string | undefined): Promise<UserRole | null> {
  if (!supabaseEmail) return null;
  ensureUsersStoreInitialized();
  const users: User[] = globalThis._usersStore || [];
  // This assumes `username` in _usersStore is the email.
  const appUser = users.find(u => u.username.toLowerCase() === supabaseEmail.toLowerCase());
  return appUser ? appUser.role : null; 
}
