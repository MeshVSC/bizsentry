
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

// Define initialUsersSeed at the top level of the module
const initialUsersSeed: User[] = [
  { id: "1", username: "admin", password: "adminpassword", role: "admin" },
  { id: "2", username: "viewer", password: "viewerpassword", role: "viewer" },
  { id: "3", username: "manager_user", password: "managerpassword", role: "manager" },
];

// Main initialization for the module.
// This ensures _usersStore is initialized when the module is first loaded.
if (typeof globalThis._usersStore === "undefined") {
  // Use a deep copy to prevent modification of the seed array if _usersStore is directly assigned this.
  globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
}

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string; user?: CurrentUser }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, message: "Username and password are required." };
  }

  // Ensure users store is available
  if (typeof globalThis._usersStore === "undefined") {
      // This should ideally not be hit if the top-level initialization works,
      // but as a fallback for extreme dev server scenarios:
      globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
  const users: User[] = globalThis._usersStore;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const currentUserData: CurrentUser = { id: user.id, username: user.username, role: user.role };
    cookies().set('sessionUserId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // True for HTTPS, false for HTTP
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax', // Good default for security
    });
    revalidatePath("/", "layout"); // Re-add this to try and force a full refresh
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
    sameSite: 'lax',
  });
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  await new Promise(resolve => setTimeout(resolve, 10)); // Simulate small delay
  const userId = cookies().get('sessionUserId')?.value;

  // Defensive check and re-initialization for _usersStore
  // This is a workaround for potential dev server inconsistencies with globalThis state.
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
  const users: User[] = globalThis._usersStore;

  if (userId && users) { // Ensure users array exists
    const userFromStore = users.find(u => u.id === userId);
    if (userFromStore) {
      return { id: userFromStore.id, username: userFromStore.username, role: userFromStore.role };
    }
  }
  return null;
}

export async function getUsers(): Promise<UserView[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
  const users: User[] = globalThis._usersStore;
  return users.map(({ password, ...userView }) => userView);
}

export async function addUser(data: UserFormInput): Promise<{ success: boolean; message?: string; user?: UserView }> {
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
  const users: User[] = globalThis._usersStore;

  if (!data.username || !data.password || !data.role) {
    return { success: false, message: "Username, password, and role are required." };
  }
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { success: false, message: `Username "${data.username}" already exists.` };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username: data.username,
    password: data.password, // Storing plaintext password
    role: data.role,
  };
  users.push(newUser); // This modifies the array referenced by globalThis._usersStore

  revalidatePath("/settings/users", "page");
  const { password, ...userView } = newUser;
  return { success: true, message: `User "${newUser.username}" added successfully.`, user: userView };
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string; user?: UserView }> {
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
  const users: User[] = globalThis._usersStore;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }

  const currentUser = await getCurrentUser();
  // Prevent non-admins from changing roles, or admin from demoting last admin
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
  // globalThis._usersStore is already the 'users' array reference, so modification is direct.

  revalidatePath("/settings/users", "page");
  // If the current user's role was changed, we need to update their session/cookie if that matters
  // For this prototype, getCurrentUser will re-fetch, but a real app might need more proactive session update.
  // Forcing a layout revalidation is generally good.
  if (currentUser && currentUser.id === userId && currentUser.role !== newRole) {
    revalidatePath("/", "layout"); 
  }

  const { password, ...userView } = users[userIndex];
  return { success: true, message: `User "${userView.username}" role updated to ${newRole}.`, user: userView };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  if (typeof globalThis._usersStore === "undefined") {
    globalThis._usersStore = JSON.parse(JSON.stringify(initialUsersSeed));
  }
  let users: User[] = globalThis._usersStore; // Get a reference to the global store
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }

  const currentUser = await getCurrentUser();
  // Prevent non-admins from deleting users
  if (currentUser?.role !== 'admin') {
      return { success: false, message: "Permission denied to delete users." };
  }
  // Prevent admin from deleting themselves
  if (currentUser && currentUser.id === userId) {
    return { success: false, message: "Cannot delete the currently logged-in user." };
  }
  
  // Prevent deleting the last admin
  if (users[userIndex].role === 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
        return { success: false, message: "Cannot delete the last administrator." };
    }
  }

  const deletedUsername = users[userIndex].username;
  // Filter out the user and reassign to globalThis._usersStore
  globalThis._usersStore = users.filter(u => u.id !== userId);

  revalidatePath("/settings/users", "page");
  return { success: true, message: `User "${deletedUsername}" deleted successfully.` };
}

// TODO: Item 5: Password Reset Functionality
// Implement password reset functionality. This will require a mechanism for users
// to securely verify their identity (e.g., email verification, security questions if desired,
// or admin-initiated reset). Current system does not store emails.
// This is a significant feature and needs careful design.
