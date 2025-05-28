
export type UserRole = 'admin' | 'manager' | 'viewer'; // Added 'manager'

export interface User {
  id: string;
  username: string;
  password?: string; 
  role: UserRole;
}

export interface UserView extends Omit<User, 'password'> {}

export interface UserFormInput {
  username: string;
  password?: string; 
  role: UserRole;
}

export interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
}
