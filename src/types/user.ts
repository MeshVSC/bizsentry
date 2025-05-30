
export type UserRole = 'admin' | 'manager' | 'viewer';

// Represents a user in our custom stock_sentry_users Supabase table
export interface User {
  id: string; // UUID from Supabase
  username: string; // Used as email/login ID, should be unique
  password_text: string; // Plaintext password - NOT SECURE FOR PRODUCTION
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// View model for displaying users (omits password)
export interface UserView extends Omit<User, 'password_text'> {}

// Input for the "Add User" form (for the custom table)
export interface UserFormInput {
  username: string; // Email format
  password?: string; // Password is now required for custom table
  role: UserRole;
}

// Represents the currently logged-in user from our custom system
export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
}
