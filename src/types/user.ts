
export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  password?: string; // Only present when creating/checking, not stored long-term if hashed
  role: UserRole;
}

// For displaying users in a list (without password)
export interface UserView extends Omit<User, 'password'> {}

// For adding a new user via a form
export interface UserFormInput {
  username: string;
  password?: string; // Password is required for add, optional for edit (if we implement edit user)
  role: UserRole;
}

export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
}

