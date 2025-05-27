
"use server";

import type { User, UserRole, CurrentUser } from "@/types/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// --- VERY IMPORTANT ---
// THIS IS A PROTOTYPE AUTH SYSTEM AND IS NOT SECURE.
// Passwords are in plaintext. DO NOT USE IN PRODUCTION.
// For production, use a proper auth solution (e.g., NextAuth.js, Firebase Auth)
// and proper password hashing (e.g., bcrypt, Argon2).
// --- VERY IMPORTANT ---

if (typeof globalThis._usersStore === "undefined") {
  globalThis._usersStore = [
    {
      id: "1",
      username: "admin",
      password: "adminpassword", // Storing plaintext for prototype simplicity
      role: "admin",
    },
    {
      id: "2",
      username: "viewer",
      password: "viewerpassword", // Storing plaintext for prototype simplicity
      role: "viewer",
    },
  ];
}

if (typeof globalThis._currentUserStore === "undefined") {
  globalThis._currentUserStore = null;
}

export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; message?: string; user?: CurrentUser }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, message: "Username and password are required." };
  }

  const users = globalThis._usersStore;
  const user = users.find(
    (u) => u.username === username && u.password === password // Plaintext check for prototype
  );

  if (user) {
    const currentUserData: CurrentUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    globalThis._currentUserStore = currentUserData;
    // Revalidate all layouts to ensure currentUser is updated everywhere
    revalidatePath("/", "layout");
    return { success: true, user: currentUserData };
  } else {
    return { success: false, message: "Invalid username or password." };
  }
}

export async function logoutUser() {
  globalThis._currentUserStore = null;
  revalidatePath("/", "layout"); // Revalidate all layouts
  redirect("/login");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 10));
  return globalThis._currentUserStore ? { ...globalThis._currentUserStore } : null;
}

// Placeholder for future admin user management - NOT fully implemented in this step
export async function getUsers(): Promise<User[]> {
  return JSON.parse(JSON.stringify(globalThis._usersStore.map(u => ({...u, password: ''})))); // Don't send passwords
}

export async function addUser(username: string, password // For prototype, plaintext
  : string, role: UserRole): Promise<User> {
  const id = crypto.randomUUID();
  const newUser: User = { id, username, password, role };
  globalThis._usersStore.push(newUser);
  revalidatePath("/admin/users"); // Assuming an admin users page might exist
  return JSON.parse(JSON.stringify({...newUser, password: ''}));
}
