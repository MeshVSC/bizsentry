
"use client"; // This page is now a Client Component

import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers } from '@/lib/actions/userActions'; // Server action
import type { UserView } from '@/types/user';
import { AlertTriangle } from 'lucide-react';
import AddUserForm from '@/components/settings/AddUserForm';
import UserManagementTable from '@/components/settings/UserManagementTable';
import { useAuth } from '@/contexts/AuthContext'; // Use client-side context
import { useEffect, useState } from 'react';

export default function UserSettingsPage() {
  const { currentUser } = useAuth(); // Get user from client-side context
  const [allUsers, setAllUsers] = useState<UserView[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      if (currentUser?.role === 'admin') {
        try {
          setLoadingUsers(true);
          const usersData = await getUsers(); // Server Action call
          setAllUsers(usersData);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setLoadingUsers(false);
        }
      }
    }
    fetchUsers();
  }, [currentUser]); // Re-fetch if currentUser changes or role allows

  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          Only administrators can manage users.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage application users and their roles."
      />
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Add new users or modify existing ones. User data is stored in your database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <AddUserForm />
          {loadingUsers ? <p>Loading users...</p> : <UserManagementTable initialUsers={allUsers} />}
        </CardContent>
      </Card>
    </>
  );
}
