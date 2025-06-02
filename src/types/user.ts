
export type UserRole = 'admin' | 'manager' | 'viewer';

// Represents a user in our custom stock_sentry_users Supabase table
export interface User {
  id: string; // UUID from Supabase
  username: string; // Used as login ID
  password_text: string; // Plaintext password - NOT SECURE FOR PRODUCTION
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// View model for displaying users (omits password)
export interface UserView extends Omit<User, 'password_text'> {}

// Input for the "Add User" form (for the custom table)
export interface UserFormInput {
  username: string;
  password?: string; // Password required for adding users
  role: UserRole;
}

// Represents the currently logged-in user from our custom system
export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface GetCurrentUserResult {
  user: CurrentUser | null; // Explicitly null if no valid user
  debugMessage?: string;
}
