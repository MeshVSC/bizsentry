
"use server";

import type { User, UserRole, UserFormInput, UserView } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

// --- IMPORTANT ---
// Supabase handles actual user authentication (login/password).
// This _usersStore is an IN-MEMORY list used to map Supabase authenticated user emails
// to application-specific roles (admin, manager, viewer).
// The "User Management" settings page interacts with this _usersStore.
// Passwords in initialUsersSeed are for conceptual seeding only and are NOT used for Supabase login.
// --- IMPORTANT ---

const initialUsersSeed: User[] = [
  { id: "1", username: "admin@example.com", password: "adminpassword_seed_only", role: "admin" },
  { id: "2", username: "viewer@example.com", password: "viewerpassword_seed_only", role: "viewer" },
  { id: "3", username: "manager@example.com", password: "managerpassword_seed_only", role: "manager" },
];

function ensureUsersStoreInitialized() {
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
}

// Supabase handles login; this server action is effectively a no-op now
// but kept for potential future use or if a non-Supabase path was re-enabled.
export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  // Actual login is handled client-side by Supabase
  // This server action might be called if form action points here,
  // but Supabase login on client should precede.
  // For safety, we can assume this is a fallback and check internal store,
  // but primary auth is Supabase.
  ensureUsersStoreInitialized();
  const email = formData.get("email") as string; 
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  
  // This part is somewhat disconnected from Supabase login.
  // If Supabase login succeeded, this might not even be hit directly.
  // If it IS hit, it means the client-side Supabase login form might be submitting here,
  // which is not the primary Supabase auth flow.
  // The redirect('/dashboard') is now better handled client-side after Supabase successful login.
  // For now, let's keep the cookie logic just in case, but acknowledge it's secondary.

  const users: User[] = globalThis._usersStore || [];
  const user = users.find(
    (u) => u.username.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    // This cookie setting is now largely superseded by Supabase session management
    // but can be kept for symmetry with getCurrentUser if it were to use cookies primarily.
    cookies().set('stocksentry_session_userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    redirect('/dashboard');
  } else {
    return { success: false, message: "Invalid email or password (from local store check)." };
  }
}

// Supabase handles logout client-side. This is a server-side clear for our cookie.
export async function logoutUser() {
  cookies().set('stocksentry_session_userId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
  // Client-side Supabase logout will also handle redirect.
  // This server-side redirect is a fallback.
  redirect("/login");
}

// This function remains to map a Supabase authenticated user (via their email from session)
// to an application-specific role stored in _usersStore.
export async function getCurrentUser(): Promise<UserView | null> {
  // This function is less critical now as AppLayout uses Supabase session directly.
  // It's used by settings pages to check app-specific role.
  ensureUsersStoreInitialized();
  const userIdFromCookie = cookies().get('stocksentry_session_userId')?.value;

  if (!userIdFromCookie) {
    return null;
  }

  const users: User[] = globalThis._usersStore || [];
  const user = users.find((u) => u.id === userIdFromCookie);

  if (user) {
    const { password, ...userView } = user;
    return userView;
  }
  return null;
}


// --- User Role Management (for _usersStore) ---

export async function getUsers(): Promise<UserView[]> {
  ensureUsersStoreInitialized();
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  const users: User[] = globalThis._usersStore || [];
  return users.map(({ password, ...userView }) => userView);
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  ensureUsersStoreInitialized();
  const users: User[] = globalThis._usersStore || [];

  if (!data.username || !data.role) { // Password is now optional for this form
    return { success: false, message: "Email and role are required." };
  }
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { success: false, message: `User role assignment for email "${data.username}" already exists.` };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username: data.username, // This is the email
    // Password from form is now optional and not critical for role assignment
    // We store undefined if not provided, or the dummy password if it was part of the input.
    password: data.password || undefined, 
    role: data.role,
  };
  users.push(newUser);
  globalThis._usersStore = users;

  revalidatePath("/settings/users", "page");
  const { password, ...userView } = newUser;
  return { success: true, message: `User role for "${newUser.username}" assigned. This does NOT create a Supabase login.`, user: userView };
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  ensureUsersStoreInitialized();
  const users: User[] = globalThis._usersStore || [];
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User role assignment not found." };
  }
  
  // For role updates, we rely on the Supabase session in AppLayout for the current user's permissions.
  // The check here could be simplified or rely on a passed current Supabase user context if needed.
  // For now, this simple check remains for the prototype context.
  const currentUserFromCookie = await getCurrentUser(); 
  if (!currentUserFromCookie || currentUserFromCookie.role !== 'admin') {
      return { success: false, message: "Permission denied to change roles." };
  }

  if (users[userIndex].role === 'admin' && newRole !== 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, message: "Cannot remove the last administrator's role." };
    }
  }
  
  users[userIndex].role = newRole;
  globalThis._usersStore = users;

  revalidatePath("/settings/users", "page");
  
  const { password, ...userView } = users[userIndex];
  return { success: true, message: `User "${userView.username}" role updated to ${newRole}.`, user: userView };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  ensureUsersStoreInitialized();
  let users: User[] = globalThis._usersStore || [];
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User role assignment not found." };
  }

  const currentUserFromCookie = await getCurrentUser();
  if (!currentUserFromCookie || currentUserFromCookie.role !== 'admin') {
      return { success: false, message: "Permission denied to delete user role assignments." };
  }
  // Cannot delete self from this list if you are currently identified via this cookie method
  if (currentUserFromCookie && currentUserFromCookie.id === userId) {
    return { success: false, message: "Cannot delete your own role assignment." };
  }
  
  if (users[userIndex].role === 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1 && users[userIndex].id === currentUserFromCookie?.id) {
        // This logic is tricky: if deleting the last admin who is also the current user.
        // Better to just prevent deleting self if admin.
        return { success: false, message: "Cannot delete the last administrator if it's yourself." };
    } else if (adminCount <=1) {
        return { success: false, message: "Cannot delete the last administrator." };
    }
  }

  const deletedUsername = users[userIndex].username;
  globalThis._usersStore = users.filter(u => u.id !== userId);

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User role assignment for "${deletedUsername}" deleted.` };
}


// Function to get app-specific role for a Supabase authenticated user by their email
export async function getRoleForSupabaseUser(supabaseEmail: string | undefined): Promise<UserRole | null> {
  if (!supabaseEmail) return null;
  ensureUsersStoreInitialized();
  const users: User[] = globalThis._usersStore || [];
  // This assumes `username` in _usersStore is the email.
  const appUser = users.find(u => u.username.toLowerCase() === supabaseEmail.toLowerCase());
  return appUser ? appUser.role : null; 
}
