
export type UserRole = 'admin' | 'manager' | 'viewer';

// Represents a user in our app's internal (in-memory) store
// This is now separate from Supabase's User object for authentication
export interface User {
  id: string;
  username: string; // Represents the email for Supabase compatibility and local store
  password?: string; // For the in-memory store, not for Supabase auth
  role: UserRole;
}

// View model for displaying users (omits password)
export interface UserView extends Omit<User, 'password'> {}

// Input for the "Add User" form (for the in-memory store)
export interface UserFormInput {
  username: string; // Represents the email
  password?: string; 
  role: UserRole;
}

// Represents the currently authenticated Supabase user's app-specific context
// This might combine Supabase user info with roles from our app's store
export interface CurrentAppContextUser {
  id: string; // Supabase User ID
  email?: string; // Supabase User Email
  appRole: UserRole | null; // Role from our application's user store
}
