
export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  password?: string; // Only present when creating/checking, not stored long-term if hashed
  passwordHash?: string; // For a more realistic approach, though we'll use plaintext for prototype
  role: UserRole;
}

export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
}
