
"use server";

import type { User, UserRole, CurrentUser, UserFormInput, UserView } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

// --- VERY IMPORTANT ---
// THIS IS A PROTOTYPE AUTH SYSTEM AND IS NOT SECURE.
// Passwords are in plaintext. DO NOT USE IN PRODUCTION.
// For production, use a proper auth solution (e.g., NextAuth.js, Firebase Auth)
// and proper password hashing (e.g., bcrypt, Argon2).
// --- VERY IMPORTANT ---

if (typeof globalThis._usersStore === "undefined") {
  globalThis._usersStore = [
    { id: "1", username: "admin", password: "adminpassword", role: "admin" },
    { id: "2", username: "viewer", password: "viewerpassword", role: "viewer" },
    { id: "3", username: "manager_user", password: "managerpassword", role: "manager" },
  ];
}

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string; user?: CurrentUser }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, message: "Username and password are required." };
  }

  const users: User[] = globalThis._usersStore || [];
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const currentUserData: CurrentUser = { id: user.id, username: user.username, role: user.role };
    cookies().set('sessionUserId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    // Removed revalidatePath("/", "layout"); It will be handled by client-side router.refresh()
    return { success: true, user: currentUserData };
  } else {
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser() {
  cookies().set('sessionUserId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  revalidatePath("/", "layout"); // Revalidate after logout to ensure UI updates
  redirect("/login");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  await new Promise(resolve => setTimeout(resolve, 10)); 
  const userId = cookies().get('sessionUserId')?.value;

  if (userId) {
    const users: User[] = globalThis._usersStore || []; // Ensure usersStore is accessed, it should be initialized
    const user = users.find(u => u.id === userId);
    if (user) {
      return { id: user.id, username: user.username, role: user.role };
    }
  }
  return null;
}

export async function getUsers(): Promise<UserView[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const users: User[] = globalThis._usersStore || [];
  return users.map(({ password, ...userView }) => userView);
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const users: User[] = globalThis._usersStore || [];
  if (!data.username || !data.password || !data.role) {
    return { success: false, message: "Username, password, and role are required." };
  }
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { success: false, message: `Username "${data.username}" already exists.` };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username: data.username,
    password: data.password, 
    role: data.role,
  };
  users.push(newUser);
  globalThis._usersStore = users;

  revalidatePath("/settings/users", "page");
  const { password, ...userView } = newUser;
  return { success: true, message: `User "${newUser.username}" added successfully.`, user: userView };
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  const users: User[] = globalThis._usersStore || [];
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }
  
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== 'admin') {
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
  
  // If admin changes their own role, and they are currently logged in
  if (currentUser && currentUser.id === userId && currentUser.role !== newRole) {
    // Update the cookie with the new role by re-setting it.
    // This is a simplified approach. A real app might re-issue a session token.
     cookies().set('sessionUserId', currentUser.id, { // Re-set to potentially update any session data if it were more complex
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });
    revalidatePath("/", "layout"); 
  }

  const { password, ...userView } = users[userIndex];
  return { success: true, message: `User "${userView.username}" role updated to ${newRole}.`, user: userView };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  let users: User[] = globalThis._usersStore || [];
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }

  const currentUser = await getCurrentUser();
  if (currentUser?.role !== 'admin') {
      return { success: false, message: "Permission denied to delete users." };
  }

  if (currentUser && currentUser.id === userId) {
    return { success: false, message: "Cannot delete the currently logged-in user." };
  }
  
  if (users[userIndex].role === 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
        return { success: false, message: "Cannot delete the last administrator." };
    }
  }

  const deletedUsername = users[userIndex].username;
  users = users.filter(u => u.id !== userId);
  globalThis._usersStore = users;

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${deletedUsername}" deleted successfully.` };
}

// TODO: Placeholder for Item 5: Password Reset Functionality
// Implement password reset functionality. This will require a mechanism for users
// to securely verify their identity (e.g., email verification, security questions if desired,
// or admin-initiated reset). Current system does not store emails.
// This is a significant feature and needs careful design.
